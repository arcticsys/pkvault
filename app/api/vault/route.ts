import { prismaClient } from '../databases';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const data = await prismaClient.save.findMany();
        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error('[GET] Failure in /api/vault:', error);
        return NextResponse.json({ error: '[GET] Failure in /api/vault' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        //const body = await request.json() as ApiVaultPostRequest;
        const body = await request.json();
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: '[POST] No body or bad body type (expected: object/non-stringified JSON) in /api/vault' }, { status: 400 });
        }
        const result = await prismaClient.save.create({
            data: body,
        });
        if (!result) {
            return NextResponse.json({ error: '[POST] Failed to create entry in /api/vault' }, { status: 500 });
        }
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('[POST] Failure in /api/vault:', error);
        return NextResponse.json({ error: '[POST] Failure in /api/vault' }, { status: 500 });
    }
}