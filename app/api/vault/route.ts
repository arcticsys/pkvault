import { prismaClient } from '../databases';
import { NextRequest, NextResponse } from 'next/server';
import { getnativename, getlanguageflag, PokemonSpeciesName } from '@/app/lib';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const search = url.searchParams.get('search') || '';
        const generation = url.searchParams.get('generation');
        const legal = url.searchParams.get('legal');
        const skip = (page - 1) * limit;
        const where: any = {};

        if (search) {
            where.OR = [
                { nickname: { contains: search, mode: 'insensitive' } },
                { ot: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (generation) {
            where.generation = parseInt(generation);
        }

        if (legal !== null && legal !== undefined) {
            where.legal = legal === 'true';
        }

        const [pokemon, total] = await Promise.all([
            prismaClient.pokemon.findMany({
                where,
                orderBy: { extractedtime: 'desc' },
                skip,
                take: limit,
                include: {
                    save: {
                        select: { filepath: true, timestamp: true }
                    }
                }
            }),
            prismaClient.pokemon.count({ where })
        ]);

        const data = pokemon.map(p => {
            const nativename = getnativename(p.species as PokemonSpeciesName, p.language);
            const displayname = p.nickname || nativename;
            const languageflag = getlanguageflag(p.language);
            const pokemonimageurl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.speciesid}.png`;

            return {
                id: p.id,
                displayname,
                nativename,
                languageflag,
                pokemonimageurl,
                nickname: p.nickname,
                species: p.species,
                speciesid: p.speciesid,
                generation: p.generation,
                language: p.language,
                gender: p.gender,
                exp: p.exp,
                evs: p.evs,
                ivs: p.ivs,
                ot: p.ot,
                legal: p.legal,
                legalreason: p.legalreason,
                type: p.type,
                hometracker: p.hometracker,
                sourcefile: p.save?.filepath || p.sourcepath || 'Individual file',
                savetimestamp: p.save?.timestamp,
                timestamp: p.timestamp,
                extractedtime: p.extractedtime
            };
        });

        return NextResponse.json({
            data,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }, { status: 200 });

    } catch (error) {
        console.error('[Server/GET] Error fetching vault data:', error);
        return NextResponse.json({ error: '[Server/GET] Failed to fetch vault data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: '[Server/POST] No body or bad body type (expected: object/non-stringified JSON) in /api/vault' }, { status: 400 });
        }
        const result = await prismaClient.save.create({
            data: body,
        });
        if (!result) {
            return NextResponse.json({ error: '[Server/POST] Failed to create entry in /api/vault' }, { status: 500 });
        }
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('[Server/POST] Failure in /api/vault:', error);
        return NextResponse.json({ error: '[Server/POST] Failure in /api/vault' }, { status: 500 });
    }
}