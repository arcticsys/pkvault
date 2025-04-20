import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '../../databases';
import { writeFile } from 'fs/promises';
import * as fs from 'fs';
import { join } from 'path';

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
    return NextResponse.json({ error: '[GET] Route not found' }, { status: 404 });
}

export async function SOCKET(client: import('ws').WebSocket, request: import('http').IncomingMessage, server: import('ws').WebSocketServer, { params }: { params: Promise<{ route: string }> }) {
    const { route } = await params;
    if (route === 'upload') {
        const chunks: Record<string, { 
            chunks: string[],
            receivedChunks: number,
            totalchunks: number,
            metadata: any 
        }> = {};

        console.log('[SOCKET] Client connected to /api/data/upload');
        client.send(JSON.stringify({ message: '[SOCKET] Hello at /api/data/upload!' }));

        client.on('message', async (message) => {
            try {
                let data;
                try {
                    data = JSON.parse(message.toString());
                } catch (err) {
                    console.error('[SOCKET] Failed to parse message:', err);
                    return client.send(JSON.stringify({
                        error: '[SOCKET] Invalid JSON at /api/data/upload'
                    }));
                }
                if (data.type === 'init') {
                    console.log(`[SOCKET] Initializing upload for ${data.count} files`);
                    client.send(JSON.stringify({
                        status: 'init-received',
                        message: `Ready to receive ${data.count} files`
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
                            receivedChunks: 0,
                            totalchunks,
                            metadata
                        };
                    }
                    chunks[filename].chunks[chunkindex] = chunk;
                    chunks[filename].receivedChunks++;
                    console.log(`[SOCKET] Received chunk ${chunkindex + 1}/${totalchunks} for ${filename}, lastpart: ${lastpart}`);
                    client.send(JSON.stringify({ 
                        status: 'chunk-received', 
                        filename, 
                        chunkindex, 
                        totalchunks 
                    }));
                    if (lastpart || chunks[filename].receivedChunks === totalchunks) {
                        console.log(`[SOCKET] All chunks received for ${filename}, assembling file`);
                        const finishedfile = chunks[filename].chunks.join('');
                        const filedata = {
                            name: filename,
                            data: finishedfile,
                            timestamp: chunks[filename].metadata.timestamp,
                            parentfolder: chunks[filename].metadata.parentfolder
                        };
                        
                        try {
                            const dir = join(process.cwd(), 'data', 'backups', Date.now().toString());
                            await fs.promises.mkdir(dir, { recursive: true });
                            const path = join(dir, `${filename}.json`);
                            await writeFile(path, JSON.stringify(filedata, null, 2), 'utf-8');
                            client.send(JSON.stringify({ 
                                status: 'file-complete', 
                                filename 
                            }));
                            delete chunks[filename];
                            if (Object.keys(chunks).length === 0) {
                                console.log('[SOCKET] All files uploaded successfully');
                                client.send(JSON.stringify({ 
                                    status: 'all-complete', 
                                    success: true 
                                }));
                            }
                        } catch (error) {
                            console.error(`[SOCKET] Error saving file ${filename}:`, error);
                            client.send(JSON.stringify({ 
                                error: `[SOCKET] Failed to save file ${filename}: ${error}` 
                            }));
                            if (Object.keys(chunks).length === 0) {
                                console.log('[SOCKET] Some files failed to upload');
                                client.send(JSON.stringify({ 
                                    status: 'failed-to-upload', 
                                    success: false 
                                }));
                            }
                        }
                    }
                    return;
                }
                console.warn('[SOCKET] Received unknown message type:', data.type);
                client.send(JSON.stringify({ 
                    error: `[SOCKET] Unknown message type: ${data.type}` 
                }));
                
            } catch (error) {
                console.error('[SOCKET] Failed to process message:', error);
                client.send(JSON.stringify({ 
                    error: '[SOCKET] Failed to process message: ' + error 
                }));
            }
        });

        client.on('close', () => {
            console.log('[SOCKET] Client disconnected from /api/data/upload');
        });

        client.on('error', (error) => {
            console.error('[SOCKET] WebSocket error at /api/data/upload:', error);
        });
    } else {
        client.send(JSON.stringify({ error: '[SOCKET] Route not found' }));
        client.close();
    }
}