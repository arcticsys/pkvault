import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/app/api/databases';

function groupPokemon(pokemonList: any) {
    const groups: { [key: string]: any } = {};
    for (const pkm of pokemonList) {
        const key = pkm.speciesid;
        if (!groups[key]) {
            groups[key] = {
                speciesid: pkm.speciesid,
                species: pkm.species,
                count: 0,
                pokemon: [],
            };
        }
        groups[key].count++;
        groups[key].pokemon.push(pkm);
    }
    return Object.values(groups).sort((a, b) => b.count - a.count);
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const saveid = url.searchParams.get('id');
    if (!saveid) {
        return NextResponse.json({ error: 'Missing save id' }, { status: 400 });
    }
    try {
        const pokemonList = await prismaClient.pokemon.findMany({
            where: { saveid },
            orderBy: { extractedtime: 'asc' },
        });
        const groupedPokemon = groupPokemon(pokemonList);
        return NextResponse.json({ groupedPokemon }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch pokemon for save' }, { status: 500 });
    }
}

