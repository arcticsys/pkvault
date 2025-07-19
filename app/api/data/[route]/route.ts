import { NextRequest, NextResponse } from 'next/server';
import { handlesave, storepokemon, extractpokemonfromsave, getindexsummary, searchpokemon, generatepokemongroups, getpokemongroups, getpokemongroup } from '../../handle';
import * as fs from 'fs';
import path from 'path';
import { gethash } from '@/app/lib';

export async function GET(req: NextRequest, { params }: { params: Promise<{ route: string }> }) {
    const { route } = await params;
    if (route === 'overview') {
        try {
            const summary = await getindexsummary();
            return NextResponse.json(summary, { status: 200 });
        } catch (error) {
            console.error(`[Server/GET] Error fetching overview:`, error);
            return NextResponse.json({ error: '[Server/GET] Failed to fetch overview' }, { status: 500 });
        }        } else if (route === 'search') {
        try {
            const url = new URL(req.url);
            const speciesid = url.searchParams.get('speciesid');
            const generation = url.searchParams.get('generation');
            const legal = url.searchParams.get('legal');
            const nickname = url.searchParams.get('nickname');
            const ot = url.searchParams.get('ot');

            const filters: any = {};
            if (speciesid) filters.speciesid = parseInt(speciesid);
            if (generation) filters.generation = parseInt(generation);
            if (legal !== null) filters.legal = legal === 'true';
            if (nickname) filters.nickname = nickname;
            if (ot) filters.ot = ot;

            const results = await searchpokemon(filters);
            return NextResponse.json({ pokemon: results }, { status: 200 });
        } catch (error) {
            console.error(`[Server/GET] Error searching Pokemon:`, error);
            return NextResponse.json({ error: '[Server/GET] Failed to search Pokemon' }, { status: 500 });
        }
    } else if (route === 'evolution') {
        try {
            const groups = await getpokemongroups();
            return NextResponse.json({ groups }, { status: 200 });
        } catch (error) {
            console.error(`[Server/GET] Error getting Pokemon evolution data:`, error);
            return NextResponse.json({ error: '[Server/GET] Failed to get Pokemon evolution data' }, { status: 500 });
        }
    } else if (route === 'generatetrees') {
        try {
            const result = await generatepokemongroups();
            return NextResponse.json(result, { status: 200 });
        } catch (error) {
            console.error(`[Server/GET] Error creating Pokemon evolution data:`, error);
            return NextResponse.json({ error: '[Server/GET] Failed to create Pokemon evolution data' }, { status: 500 });
        }
    } else if (route.startsWith('evolution-')) {
        try {
            const groupid = route.replace('evolution-', '');
            const group = await getpokemongroup(groupid);
            return NextResponse.json(group, { status: 200 });
        } catch (error) {
            console.error(`[Server/GET] Error fetching Pokemon evolution:`, error);
            return NextResponse.json({ error: '[Server/GET] Failed to fetch Pokemon evolution' }, { status: 500 });
        }
    } else if (route === 'serenity') {
        try {
            const serenityp = process.env.SERENITY_PORT || '5008';
            const serenityh = process.env.SERENITY_HOST || 'localhost';
            const response = await fetch(`http://${serenityh}:${serenityp}/api/hello`);
            if (response.status === 200) {
                return NextResponse.json({ status: 200 });
            } else {
                return NextResponse.json({ error: '[Server/GET] Serenity is offline' }, { status: 503 });
            }
        } catch (error) {
            return NextResponse.json({ error: '[Server/GET] Failed to test connection' }, { status: 503 });
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
        const areweindev = process.env.NODE_ENV === 'development';

        if (areweindev) {
            console.log('[Server/SOCKET] Client connected to /api/data/upload');
        }
        client.send(JSON.stringify({ message: '[Server/SOCKET] Hello at /api/data/upload!' }));

        client.on('message', async (message) => {
            try {
                const serenityp = process.env.SERENITY_PORT || '5008';
                const serenityh = process.env.SERENITY_HOST || 'localhost';
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
                    if (areweindev) {
                        console.log(`[Server/SOCKET] Initialising upload for ${data.count} files`);
                    }
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
                                            timestamp: file.timestamp
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
                            const response = await fetch(`http://${serenityh}:${serenityp}/api/hello`);
                            if (response.status === 200) {
                                const json = await response.json();
                                if (json.online === true) {
                                    success = true;
                                    if (areweindev) {
                                        console.log('[Server/SOCKET] Serenity is online, proceeding with upload...');
                                    }
                                    break;
                                }
                            }
                        } catch (error) {
                            if (error && (error as any).code === 'ECONNREFUSED') {
                                if (areweindev) {
                                    console.error('[Server/SOCKET] Failed to test connection, got ECONNREFUSED. Did you start the Serenity server?');
                                }
                                client.send(JSON.stringify({
                                    error: '[Server/SOCKET] Failed to test connection, got ECONNREFUSED. Did you start the Serenity server?',
                                    status: 'uploadfailed',
                                    success: false
                                }));
                                client.close();
                                return;
                            }
                            if (areweindev) {
                                console.error(`[Server/SOCKET] Attempt ${retries + 1} failed:`, error);
                            }
                        }
                        retries++;
                        if (!success) {
                            if (areweindev) {
                                console.log(`[Server/SOCKET] Retrying Serenity connection test (${retries}/${10})...`);
                            }
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }

                    if (!success) {
                        if (areweindev) {
                            console.error('[Server/SOCKET] Failed Serenity connection test after 10 retries. Is Serenity running and accessible?');
                        }
                        client.send(JSON.stringify({
                            error: '[Server/SOCKET] Failed Serenity connection test after 10 retries. Is Serenity running and accessible?',
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
                    if (areweindev) {
                        console.log(`[Server/SOCKET] Received chunk ${chunkindex + 1}/${totalchunks} for ${filename}, lastpart: ${lastpart}`);
                    }
                    client.send(JSON.stringify({
                        status: 'chunk',
                        filename,
                        chunkindex,
                        totalchunks
                    }));
                    if (lastpart || chunks[filename].receivedchunks === totalchunks) {
                        if (areweindev) {
                            console.log(`[Server/SOCKET] All chunks received for ${filename}, assembling file`);
                        }
                        const finishedfile = chunks[filename].chunks.join('');

                        if (chunks[filename].hash) {
                            const hash = await gethash(finishedfile);
                            if (hash !== chunks[filename].hash) {
                                if (areweindev) {
                                    console.error(`[Server/SOCKET] Hash verification failed for ${filename}`);
                                    console.error(`[Server/SOCKET] Expected: ${chunks[filename].hash}`);
                                    console.error(`[Server/SOCKET] Received: ${hash}`);
                                }
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
                            if (areweindev) {
                                console.log(`[Server/SOCKET] Hash verification successful for ${filename}`);
                            }
                        }

                        const filedata = {
                            name: filename,
                            data: finishedfile,
                            timestamp: chunks[filename].metadata.timestamp,
                            hash: chunks[filename].hash || await gethash(finishedfile),
                            properdir: filename
                        };
                        try {
                            const dir = path.join(process.cwd(), 'data', 'backups', backupid);
                            await fs.promises.mkdir(dir, { recursive: true });
                            const filepath = path.join(dir, filedata.properdir);
                            await fs.promises.mkdir(path.dirname(filepath), { recursive: true });
                            const filecontents = Buffer.from(filedata.data, 'base64');
                            await fs.promises.writeFile(filepath, filecontents, 'binary');
                            if (areweindev) {
                                console.log(`[Server/SOCKET] Processing file ${filename} for database indexing`);
                            }
                            try {
                                const { save, saveinfo } = await handlesave(finishedfile, filedata.properdir, new Date(), filedata.timestamp ? new Date(filedata.timestamp) : new Date());
                                if (areweindev) {
                                    console.log(`[Server/SOCKET] Save ${filename} indexed successfully with ID: ${save.id}`);
                                }
                                const extractedpokemon = await extractpokemonfromsave(saveinfo, save.id, save.timestamp, new Date(), filedata.properdir, filedata.timestamp ? new Date(filedata.timestamp) : new Date());
                                if (areweindev) {
                                    console.log(`[Server/SOCKET] Extracted ${extractedpokemon.length} Pokemon from save ${filename}`);
                                }
                                client.send(JSON.stringify({
                                    status: 'filecomplete',
                                    filename,
                                    indexed: true,
                                    saveid: save.id,
                                    pokemoncount: extractedpokemon.length
                                }));
                                delete chunks[filename];
                                if (Object.keys(chunks).length === 0) {
                                    if (areweindev) {
                                        console.log('[Server/SOCKET] All files uploaded and indexed successfully');
                                    }
                                    client.send(JSON.stringify({
                                        status: 'complete',
                                        success: true
                                    }));
                                }
                            } catch (saveprocessingerror) {
                                if (saveprocessingerror instanceof Error && saveprocessingerror.message === 'NOT_SAVE_FILE') {
                                    if (areweindev) {
                                        console.log(`[Server/SOCKET] File ${filename} is not a save file, trying as individual Pokemon file`);
                                    }
                                } else {
                                    if (areweindev) {
                                        console.log(`[Server/SOCKET] Save processing failed for ${filename}, trying as individual Pokemon file`);
                                    }
                                }
                                try {
                                    const pokemon = await storepokemon(finishedfile, null, filedata.timestamp, new Date(), filedata.properdir, filedata.timestamp ? new Date(filedata.timestamp) : new Date());
                                    if (areweindev) {
                                        console.log(`[Server/SOCKET] Pokemon file ${filename} indexed successfully with ID: ${pokemon.id}`);
                                    }
                                    client.send(JSON.stringify({
                                        status: 'filecomplete',
                                        filename,
                                        indexed: true,
                                        pokemonid: pokemon.id,
                                        ispokemonfile: true
                                    }));
                                    delete chunks[filename];
                                    if (Object.keys(chunks).length === 0) {
                                        if (areweindev) {
                                            console.log('[Server/SOCKET] All files uploaded and indexed successfully');
                                        }
                                        client.send(JSON.stringify({
                                            status: 'complete',
                                            success: true
                                        }));
                                    }
                                } catch (pokemonprocessingerror) {
                                    if (areweindev) {
                                        console.error(`[Server/SOCKET] Failed to process ${filename} as either save or Pokemon file:`, pokemonprocessingerror);
                                    }
                                    client.send(JSON.stringify({
                                        error: `[Server/SOCKET] Failed to process file ${filename}: not a valid save or Pokemon file`,
                                        filename
                                    }));
                                    delete chunks[filename];
                                    if (Object.keys(chunks).length === 0) {
                                        client.send(JSON.stringify({
                                            status: 'uploadfailed',
                                            success: false
                                        }));
                                    }
                                }
                            }
                        } catch (error) {
                            if (areweindev) {
                                console.error(`[Server/SOCKET] Error saving file ${filename}:`, error);
                            }
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
                if (areweindev) {
                    console.warn('[Server/SOCKET] Received unknown message type:', data.type);
                }
                client.send(JSON.stringify({
                    error: `[Server/SOCKET] Unknown message type: ${data.type}`
                }));
            } catch (error) {
                if (areweindev) {
                    console.error('[Server/SOCKET] Failed to process message:', error);
                }
                client.send(JSON.stringify({
                    error: '[Server/SOCKET] Failed to process message: ' + error
                }));
            }
        });
        client.on('close', () => {
            if (areweindev) {
                console.log('[Server/SOCKET] Client disconnected from /api/data/upload');
            }
            (async () => {
                try {
                    const backups = path.join(process.cwd(), 'data', 'backups');
                    const folders = await fs.promises.readdir(backups, { withFileTypes: true });

                    for (const folder of folders) {
                        if (folder.isDirectory()) {
                            const fp = path.join(backups, folder.name);
                            const files = await fs.promises.readdir(fp);
                            if (files.length === 0) {
                                if (areweindev) {
                                    console.log(`[Server/SOCKET] Removing empty backup folder: ${fp}`);
                                }
                                await fs.promises.rmdir(fp);
                            }
                        }
                    }
                } catch (error) {
                    if (areweindev) {
                        console.error('[Server/SOCKET] Error while cleaning up empty backup folders:', error);
                    }
                }
            })();
        });

        client.on('error', (error) => {
            if (areweindev) {
                console.error('[Server/SOCKET] WebSocket error at /api/data/upload:', error);
            }
        });
    } else {
        client.send(JSON.stringify({ error: '[Server/SOCKET] Route not found' }));
        client.close();
    }
}