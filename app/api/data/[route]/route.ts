import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '../../databases';
import * as fs from 'fs';
import path from 'path';
import { gethash } from '@/app/lib';

export async function GET(req: NextRequest, { params }: { params: Promise<{ route: string }> }) {
    const { route } = await params;
    if (route === 'overview') {
        try {
            const count = await prismaClient.pokemon.count();
            return NextResponse.json({ count }, { status: 200 });
        } catch (error) {
            console.error(error);
        }
    }
    return NextResponse.json({ error: '[Server/GET] Route not found' }, { status: 404 });
}

export async function SOCKET(client: import('ws').WebSocket, request: import('http').IncomingMessage, server: import('ws').WebSocketServer, { params }: { params: Promise<{ route: string }> }) {
    const { route } = await params;
    if (route === 'upload') {
        const chunks: Record<string, {
            chunks: string[],
            receivedchunks: number,
            totalchunks: number,
            metadata: any,
            hash?: string
        }> = {};
        const backupid = Date.now().toString();

        console.log('[Server/SOCKET] Client connected to /api/data/upload');
        client.send(JSON.stringify({ message: '[Server/SOCKET] Hello at /api/data/upload!' }));

        client.on('message', async (message) => {
            try {
                const serenityp = process.env.SERENITY_PORT || '5008';
                let data;
                try {
                    data = JSON.parse(message.toString());
                } catch (err) {
                    console.error('[Server/SOCKET] Failed to parse message:', err);
                    return client.send(JSON.stringify({
                        error: '[Server/SOCKET] Invalid JSON at /api/data/upload'
                    }));
                }
                if (data.type === 'init') {
                    console.log(`[Server/SOCKET] Initialising upload for ${data.count} files`);
                    const dir = path.join(process.cwd(), 'data', 'backups', backupid);
                    await fs.promises.mkdir(dir, { recursive: true });

                    if (data.files) {
                        data.files.forEach((file: any) => {
                            if (file.name && file.hash) {
                                if (!chunks[file.name]) {
                                    chunks[file.name] = {
                                        chunks: [],
                                        receivedchunks: 0,
                                        totalchunks: 0,
                                        metadata: {
                                            timestamp: file.timestamp,
                                            parentfolder: file.parentfolder || ""
                                        },
                                        hash: file.hash
                                    };
                                } else {
                                    chunks[file.name].hash = file.hash;
                                }
                            }
                        });
                    }

                    let retries = 0;
                    let success = false;

                    while (retries < 10 && !success) {
                        try {
                            const response = await fetch(`http://localhost:${serenityp}/api/hello`);
                            if (response.status === 200) {
                                const json = await response.json();
                                if (json.online === true) {
                                    success = true;
                                    console.log('[Server/SOCKET] Serenity is online, proceeding with upload...');
                                    break;
                                }
                            }
                        } catch (error) {
                            console.error(`[Server/SOCKET] Attempt ${retries + 1} failed:`, error);
                        }
                        retries++;
                        if (!success) {
                            console.log(`[Server/SOCKET] Retrying connection to Serenity (${retries}/${10})...`);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }

                    if (!success) {
                        console.error('[Server/SOCKET] Failed to connect to Serenity after maximum retries');
                        client.send(JSON.stringify({
                            error: '[Server/SOCKET] Failed to connect to Serenity',
                            status: 'uploadfailed',
                            success: false
                        }));
                        client.close();
                        return;
                    }
                    client.send(JSON.stringify({
                        status: 'gotinit',
                        message: `[Server/SOCKET] Ready to receive ${data.count} files`
                    }));
                    return;
                }
                if (data.type === 'chunk') {
                    const {
                        filename,
                        chunkindex,
                        totalchunks,
                        chunk,
                        lastpart,
                        metadata
                    } = data;
                    if (!chunks[filename]) {
                        chunks[filename] = {
                            chunks: new Array(totalchunks),
                            receivedchunks: 0,
                            totalchunks,
                            metadata
                        };
                    }
                    chunks[filename].chunks[chunkindex] = chunk;
                    chunks[filename].receivedchunks++;
                    console.log(`[Server/SOCKET] Received chunk ${chunkindex + 1}/${totalchunks} for ${filename}, lastpart: ${lastpart}`);
                    client.send(JSON.stringify({
                        status: 'chunk',
                        filename,
                        chunkindex,
                        totalchunks
                    }));
                    if (lastpart || chunks[filename].receivedchunks === totalchunks) {
                        console.log(`[Server/SOCKET] All chunks received for ${filename}, assembling file`);
                        const finishedfile = chunks[filename].chunks.join('');

                        if (chunks[filename].hash) {
                            const hash = await gethash(finishedfile);
                            if (hash !== chunks[filename].hash) {
                                console.error(`[Server/SOCKET] Hash verification failed for ${filename}`);
                                console.error(`[Server/SOCKET] Expected: ${chunks[filename].hash}`);
                                console.error(`[Server/SOCKET] Received: ${hash}`);
                                client.send(JSON.stringify({
                                    error: `[Server/SOCKET] Hash verification failed for ${filename}. File might have been corrupted in transit.`,
                                    status: 'hashfailed',
                                    filename
                                }));

                                delete chunks[filename];
                                if (Object.keys(chunks).length === 0) {
                                    client.send(JSON.stringify({
                                        status: 'uploadfailed',
                                        success: false
                                    }));
                                }
                                return;
                            }

                            console.log(`[Server/SOCKET] Hash verification successful for ${filename}`);
                            fetch(`http://localhost:${serenityp}/api/savedata`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    filename,
                                    hash,
                                    data: finishedfile,
                                    timestamp: chunks[filename].metadata.timestamp,
                                    parentfolder: chunks[filename].metadata.parentfolder
                                })
                            }).then(res => {
                                if (res.status === 200) {
                                    console.log(`[Server/SOCKET] File ${filename} saved successfully`);
                                } else {
                                    console.error(`[Server/SOCKET] Failed to save file ${filename}: ${res.statusText}`);
                                }
                            }).catch(err => {
                                console.error(`[Server/SOCKET] Error while saving file ${filename}:`, err);
                            })
                        }

                        const filedata = {
                            name: filename,
                            data: finishedfile,
                            timestamp: chunks[filename].metadata.timestamp,
                            parentfolder: chunks[filename].metadata.parentfolder,
                            hash: chunks[filename].hash || await gethash(finishedfile),
                            properdir: chunks[filename].metadata.parentfolder
                                ? path.join(chunks[filename].metadata.parentfolder, filename)
                                : filename
                        };

                        try {
                            const dir = path.join(process.cwd(), 'data', 'backups', backupid);
                            await fs.promises.mkdir(dir, { recursive: true });
                            const filepath = path.join(dir, filedata.properdir);
                            await fs.promises.writeFile(filepath, JSON.stringify(filedata, null, 2), 'utf-8');
                            client.send(JSON.stringify({
                                status: 'filecomplete',
                                filename
                            }));
                            delete chunks[filename];
                            if (Object.keys(chunks).length === 0) {
                                console.log('[Server/SOCKET] All files uploaded successfully');
                                client.send(JSON.stringify({
                                    status: 'complete',
                                    success: true
                                }));
                            }
                        } catch (error) {
                            console.error(`[Server/SOCKET] Error saving file ${filename}:`, error);
                            client.send(JSON.stringify({
                                error: `[Server/SOCKET] Failed to save file ${filename}: ${error}`
                            }));
                            if (Object.keys(chunks).length === 0) {
                                console.log('[Server/SOCKET] Some files failed to upload');
                                client.send(JSON.stringify({
                                    status: 'uploadfailed',
                                    success: false
                                }));
                            }
                        }
                    }
                    return;
                }
                console.warn('[Server/SOCKET] Received unknown message type:', data.type);
                client.send(JSON.stringify({
                    error: `[Server/SOCKET] Unknown message type: ${data.type}`
                }));

            } catch (error) {
                console.error('[Server/SOCKET] Failed to process message:', error);
                client.send(JSON.stringify({
                    error: '[Server/SOCKET] Failed to process message: ' + error
                }));
            }
        });

        client.on('close', () => {
            console.log('[Server/SOCKET] Client disconnected from /api/data/upload');
            (async () => {
                try {
                    const backups = path.join(process.cwd(), 'data', 'backups');
                    const folders = await fs.promises.readdir(backups, { withFileTypes: true });

                    for (const folder of folders) {
                        if (folder.isDirectory()) {
                            const fp = path.join(backups, folder.name);
                            const files = await fs.promises.readdir(fp);
                            if (files.length === 0) {
                                console.log(`[Server/SOCKET] Removing empty backup folder: ${fp}`);
                                await fs.promises.rmdir(fp);
                            }
                        }
                    }
                } catch (error) {
                    console.error('[Server/SOCKET] Error while cleaning up empty backup folders:', error);
                }
            })();
        });

        client.on('error', (error) => {
            console.error('[Server/SOCKET] WebSocket error at /api/data/upload:', error);
        });
    } else {
        client.send(JSON.stringify({ error: '[Server/SOCKET] Route not found' }));
        client.close();
    }
}