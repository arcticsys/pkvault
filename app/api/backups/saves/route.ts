import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/app/api/databases';

export async function GET(req: NextRequest) {
    try {
        const saves = await prismaClient.save.findMany({
            orderBy: { extractedtime: 'desc' },
        });
        const saveIds = saves.map((s) => s.id);
        const pokemonCounts = await prismaClient.pokemon.groupBy({
            by: ['saveid'],
            _count: { saveid: true },
            where: { saveid: { in: saveIds } },
        });
        const countMap = Object.fromEntries(
            pokemonCounts.map((c) => [c.saveid, c._count.saveid])
        );
        const result = saves.map((save) => ({
            id: save.id,
            filepath: save.filepath,
            timestamp: save.timestamp,
            extractedtime: save.extractedtime,
            pokemonCount: countMap[save.id] || 0,
        }));
        return NextResponse.json({ saves: result }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch saves' }, { status: 500 });
    }
}

