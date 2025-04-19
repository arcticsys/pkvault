import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '../../databases';
//import { ApiDataOverviewResponse, ApiDataSocketResponse, ApiDataUploadSocketRequest, ErrorResponse, SuccessResponse } from '@/app/lib';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function GET(req: NextRequest, { params }: { params: Promise<{ route: string }> }) {
    const { route } = await params;
    if (route === 'overview') {
        try {
            const count = await prismaClient.pokemon.count();
            //return NextResponse.json({ count } as ApiDataOverviewResponse, { status: 200 });
            return NextResponse.json({ count }, { status: 200 });
        } catch (error) {
            console.error(error);
            //return NextResponse.json({ error } as ErrorResponse, { status: 500 });
        }
    }
    //return NextResponse.json({ error: '[GET] Route not found' } as ErrorResponse, { status: 404 });
    return NextResponse.json({ error: '[GET] Route not found' }, { status: 404 });
}

export async function SOCKET(client: import('ws').WebSocket, request: import('http').IncomingMessage, server: import('ws').WebSocketServer, { params }: { params: Promise<{ route: string }> }) {
    const { route } = await params;
    if (route === 'upload') {
        client.on('message', async (message) => {
            try {
                let data;
                try {
                    //data = JSON.parse(message.toString()) as ApiDataUploadSocketRequest;
                    data = JSON.parse(message.toString());
                } catch {
                    //return client.send(JSON.stringify({ error: '[SOCKET] Invalid JSON or invalid type at /api/data/upload' } as ErrorResponse));
                    return client.send(JSON.stringify({ error: '[SOCKET] Invalid JSON or invalid type at /api/data/upload' }));
                }
                const filePath = join(process.cwd(), 'data', 'uploadedData.json');
                await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
                //client.send(JSON.stringify({ success: true } as SuccessResponse));
                client.send(JSON.stringify({ success: true }));
            } catch (error) {
                console.error('[SOCKET] Failed to upload at /api/data: ' + error);
                //client.send(JSON.stringify({ error: '[SOCKET] Failed to upload at /api/data/upload: ' + error } as ErrorResponse));
                client.send(JSON.stringify({ error: '[SOCKET] Failed to upload at /api/data/upload: ' + error }));
            }
        });

        client.on('close', () => {
            console.log('[SOCKET] Client disconnected from /api/data');
        });

        client.on('error', (error) => {
            console.error('[SOCKET] WebSocket error at /api/data:', error);
        });

        //client.send(JSON.stringify({ message: '[SOCKET] Connection established. Ready to receive data.' } as ApiDataSocketResponse));
        client.send(JSON.stringify({ message: '[SOCKET] Connection established. Ready to receive data.' }));
    } else {
        //client.send(JSON.stringify({ error: '[SOCKET] Route not found' } as ErrorResponse));
        client.send(JSON.stringify({ error: '[SOCKET] Route not found' }));
        client.close();
    }
}