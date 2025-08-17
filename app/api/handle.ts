import { prismaClient } from "./databases";

type QueueItem = | {
    type: 'save'
    savedata: string
    filepath: string
    extractedtime: Date
    usercreated?: Date
    resolve: (value: any) => void
    reject: (reason?: any) => void
} | {
    type: 'pokemon'
    pokemondata: string
    saveid: string | null
    savetimestamp: Date
    extractedtime: Date
    sourcepath?: string
    usercreated?: Date
    resolve: (value: any) => void
    reject: (reason?: any) => void
}

let queue: QueueItem[] = []
let processing = false

async function processqueue(): Promise<void> {
    if (processing || queue.length === 0) return
    processing = true
    while (queue.length > 0) {
        const item = queue.shift() as QueueItem
        if (item.type === 'save') {
            const { savedata, filepath, extractedtime, usercreated, resolve, reject } = item
            try {
                const serenityp = process.env.SERENITY_PORT || '5008'
                const serenityh = process.env.SERENITY_HOST || 'localhost'
                const response = await fetch(`http://${serenityh}:${serenityp}/api/savedata`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ savedata })
                })
                if (response.status === 422) throw new Error('NOT_SAVE_FILE')
                if (response.status !== 200) throw new Error(`Serenity (savedata) parsing failed: ${response.status}`)
                const saveinfo = await response.json()
                if (saveinfo.error) throw new Error(`Serenity (savedata) error: ${saveinfo.error}`)
                if (!saveinfo.Timestamp) {
                    saveinfo.Timestamp = usercreated ? new Date(usercreated) : new Date()
                } else {
                    saveinfo.Timestamp = new Date(Number(saveinfo.Timestamp) * 1000)
                }
                let result
                try {
                    result = await prismaClient.save.create({
                        data: {
                            data: Buffer.from(savedata, 'base64'),
                            filepath,
                            timestamp: saveinfo.Timestamp ? new Date(saveinfo.Timestamp) : new Date(),
                            extractedtime
                        }
                    })
                } catch (e: any) {
                    if (e.code === 'P2002') {
                        result = await prismaClient.save.create({
                            data: {
                                data: Buffer.from(savedata, 'base64'),
                                filepath: await getavailablefilepath(filepath),
                                timestamp: saveinfo.Timestamp ? new Date(saveinfo.Timestamp) : new Date(),
                                extractedtime
                            }
                        })
                    } else {
                        throw e
                    }
                }
                resolve({ save: result, saveinfo })
            } catch (error) {
                if (error instanceof Error && error.message === 'NOT_SAVE_FILE') reject(error)
                else {
                    console.error('[Server/Database] Error storing save:', error)
                    reject(error)
                }
            }
        } else if (item.type === 'pokemon') {
            const { pokemondata, saveid, savetimestamp, extractedtime, sourcepath, usercreated, resolve, reject } = item
            try {
                const serenityp = process.env.SERENITY_PORT || '5008'
                const serenityh = process.env.SERENITY_HOST || 'localhost'
                const [pkmdataresponse, legalityresponse] = await Promise.all([
                    fetch(`http://${serenityh}:${serenityp}/api/pkmdata`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ pkmdata: pokemondata })
                    }),
                    fetch(`http://${serenityh}:${serenityp}/api/islegal`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ pkmdata: pokemondata })
                    })
                ])
                if (pkmdataresponse.status === 422) throw new Error('NOT_PKM_FILE')
                if (pkmdataresponse.status !== 200) throw new Error(`Serenity (pkmdata) parsing failed: ${pkmdataresponse.status}`)
                const [pkminfo, legalityinfo] = await Promise.all([
                    pkmdataresponse.json(),
                    legalityresponse.status === 200 ? legalityresponse.json() : { isLegal: null, reasons: [] }
                ])
                if (pkminfo.error) throw new Error(`Serenity (pkmdata) error: ${pkminfo.error}`)
                let timestamp: Date
                if (savetimestamp) timestamp = new Date(savetimestamp)
                else if (usercreated) timestamp = new Date(usercreated)
                else timestamp = new Date()
                const speciesnames = {
                    0: pkminfo.SpeciesName?.[0] || "",
                    1: pkminfo.SpeciesName?.[1] || "",
                    2: pkminfo.SpeciesName?.[2] || "",
                    3: pkminfo.SpeciesName?.[3] || "",
                    4: pkminfo.SpeciesName?.[4] || "",
                    5: pkminfo.SpeciesName?.[5] || "",
                    6: pkminfo.SpeciesName?.[6] || "",
                    7: pkminfo.SpeciesName?.[7] || "",
                    8: pkminfo.SpeciesName?.[8] || "",
                    9: pkminfo.SpeciesName?.[9] || "",
                    10: pkminfo.SpeciesName?.[10] || ""
                }
                const evs = {
                    hp: pkminfo.EV_HP || 0,
                    attack: pkminfo.EV_ATK || 0,
                    defense: pkminfo.EV_DEF || 0,
                    spatk: pkminfo.EV_SPA || 0,
                    spdef: pkminfo.EV_SPD || 0,
                    speed: pkminfo.EV_SPE || 0
                }
                const ivs = {
                    hp: pkminfo.IV_HP || 0,
                    attack: pkminfo.IV_ATK || 0,
                    defense: pkminfo.IV_DEF || 0,
                    spatk: pkminfo.IV_SPA || 0,
                    spdef: pkminfo.IV_SPD || 0,
                    speed: pkminfo.IV_SPE || 0
                }
                const legalreasons = legalityinfo.reasons?.filter((r: any) => !r.valid)?.map((r: any) => `${r.identifier}: ${r.comment}`)?.join(' ; ') || null
                const result = await prismaClient.pokemon.create({
                    data: {
                        data: Buffer.from(pokemondata, 'base64'),
                        generation: pkminfo.Format || pkminfo.Context || 1,
                        speciesid: pkminfo.Species || 0,
                        species: speciesnames,
                        nickname: pkminfo.Nickname || null,
                        gender: pkminfo.Gender || 0,
                        exp: pkminfo.EXP || 0,
                        evs,
                        ivs,
                        type: determinefiletype(pokemondata),
                        ot: pkminfo.OriginalTrainerName || "",
                        hometracker: pkminfo.Tracker?.toString() || null,
                        language: pkminfo.Language || 2,
                        sourcepath: sourcepath || null,
                        saveid: saveid,
                        legal: legalityinfo.isLegal ?? true,
                        legalreason: legalreasons,
                        timestamp,
                        extractedtime
                    }
                })
                resolve(result)
            } catch (error) {
                if (error instanceof Error && error.message === 'NOT_PKM_FILE') reject(error)
                else {
                    console.error("[Server/Database] Error storing Pokemon:", error)
                    reject(error)
                }
            }
        }
    }
    processing = false
}

export function handlesave(savedata: string, filepath: string, extractedtime: Date, usercreated?: Date): Promise<any> {
    return new Promise((resolve, reject) => {
        queue.push({ type: 'save', savedata, filepath, extractedtime, usercreated, resolve, reject })
        processqueue()
    })
}

export function storepokemon(pokemondata: string, saveid: string | null, savetimestamp: Date, extractedtime: Date, sourcepath?: string, usercreated?: Date): Promise<any> {
    return new Promise((resolve, reject) => {
        queue.push({ type: 'pokemon', pokemondata, saveid, savetimestamp, extractedtime, sourcepath, usercreated, resolve, reject })
        processqueue()
    })
}

async function getavailablefilepath(filepath: string): Promise<string> {
    let candidate = filepath
    let counter = 2
    while (await prismaClient.save.findUnique({ where: { filepath: candidate } })) {
        const extindex = filepath.lastIndexOf('.')
        if (extindex !== -1) {
            candidate = `${filepath.slice(0, extindex)} (${counter})${filepath.slice(extindex)}`
        } else {
            candidate = `${filepath} (${counter})`
        }
        counter++
    }
    return candidate
}

export async function extractpokemonfromsave(saveinfo: any, saveid: string, savetimestamp: Date, extractedtime: Date, sourcepath?: string, usercreated?: Date) {
    try {
        const extractedpokemon: any[] = [];

        if (saveinfo.PartyData?.length > 0) {
            for (const pokemon of saveinfo.PartyData) {
                if (pokemon && pokemon.Species > 0 && pokemon.Data) {
                    const result = await storepokemon(pokemon.Data, saveid, savetimestamp, extractedtime, sourcepath, usercreated);
                    extractedpokemon.push(result);
                }
            }
        }

        for (const pokemon of saveinfo.BoxData) {
            if (pokemon && pokemon.Species > 0 && pokemon.Data) {
                const result = await storepokemon(pokemon.Data, saveid, savetimestamp, extractedtime, sourcepath, usercreated);
                extractedpokemon.push(result);
            }
        }

        return extractedpokemon;
    } catch (error) {
        console.error("[Server/Database] Error extracting Pokemon from save:", error);
        throw error;
    }
}

function determinefiletype(base64data: string): string {
    try {
        const buffer = Buffer.from(base64data, 'base64');
        const size = buffer.length;

        if (size === 136) return 'pk1';
        if (size === 80) return 'pk2';
        if (size === 80) return 'pk3';
        if (size === 136) return 'pk4';
        if (size === 136) return 'pk5';
        if (size === 232) return 'pk6';
        if (size === 232) return 'pk7';
        if (size === 328) return 'pk8';
        if (size === 344) return 'pk9';

        return 'unknown';
    } catch {
        return 'unknown';
    }
}

export async function getindexsummary() {
    try {
        const [savecount, pokemoncount, recentpokemon] = await Promise.all([
            prismaClient.save.count(),
            prismaClient.pokemon.count(),
            prismaClient.pokemon.findMany({
                take: 5,
                orderBy: { extractedtime: 'desc' },
                include: {
                    save: {
                        select: { filepath: true }
                    }
                }
            })
        ]);

        return {
            savecount,
            pokemoncount,
            recentpokemon: recentpokemon.map(p => ({
                id: p.id,
                species: p.species,
                nickname: p.nickname,
                generation: p.generation,
                language: p.language,
                legal: p.legal,
                sourcefile: p.save?.filepath || p.sourcepath || 'Individual file',
                extractedtime: p.extractedtime
            }))
        };
    } catch (error) {
        console.error("[Server/Database] Error getting index summary:", error);
        throw error;
    }
}

export async function searchpokemon(filters: {
    speciesid?: number;
    generation?: number;
    legal?: boolean;
    nickname?: string;
    ot?: string;
}) {
    try {
        const where: any = {};

        if (filters.speciesid !== undefined) where.speciesid = filters.speciesid;
        if (filters.generation !== undefined) where.generation = filters.generation;
        if (filters.legal !== undefined) where.legal = filters.legal;
        if (filters.nickname) where.nickname = { contains: filters.nickname, mode: 'insensitive' };
        if (filters.ot) where.ot = { contains: filters.ot, mode: 'insensitive' };

        const pokemon = await prismaClient.pokemon.findMany({
            where,
            orderBy: { extractedtime: 'desc' },
            take: 50,
            include: {
                save: {
                    select: { filepath: true, timestamp: true }
                }
            }
        });

        return pokemon.map(p => ({
            id: p.id,
            species: p.species,
            nickname: p.nickname,
            generation: p.generation,
            speciesid: p.speciesid,
            gender: p.gender,
            exp: p.exp,
            ot: p.ot,
            language: p.language,
            legal: p.legal,
            legalreason: p.legalreason,
            sourcefile: p.save?.filepath || p.sourcepath || 'Individual file',
            savetimestamp: p.save?.timestamp || null,
            extractedtime: p.extractedtime
        }));
    } catch (error) {
        console.error("[Server/Database] Error searching Pokemon:", error);
        throw error;
    }
}

export async function generatepokemongroups() {
    try {
        await prismaClient.pokemonGroup.deleteMany();

        const allpokemon = await prismaClient.pokemon.findMany({
            orderBy: { timestamp: 'asc' }
        });

        const groups = new Map<string, any[]>();

        for (const pokemon of allpokemon) {
            const groupkey = `${pokemon.speciesid}-${pokemon.gender}-${pokemon.ot}`;

            if (!groups.has(groupkey)) {
                groups.set(groupkey, []);
            }
            groups.get(groupkey)!.push(pokemon);
        }

        const createdgroups: any[] = [];

        for (const [groupkey, pokemonlist] of groups) {
            if (pokemonlist.length > 1) {
                const group = await prismaClient.pokemonGroup.create({
                    data: {
                        pokemon: {
                            connect: pokemonlist.map((p: any) => ({ id: p.id }))
                        }
                    }
                });
                createdgroups.push({
                    groupid: group.id,
                    pokemoncount: pokemonlist.length,
                    groupkey
                });
            }
        }

        return {
            groupscreated: createdgroups.length,
            groups: createdgroups,
            deletedprevious: true
        };
    } catch (error) {
        console.error("[Server/Database] Error generating Pokemon groups:", error);
        throw error;
    }
}

export async function getpokemongroups() {
    try {
        const groups = await prismaClient.pokemonGroup.findMany({
            include: {
                pokemon: {
                    orderBy: { timestamp: 'asc' },
                    include: {
                        save: {
                            select: { filepath: true, timestamp: true }
                        }
                    }
                }
            },
            orderBy: { timestamp: 'desc' }
        });

        return groups.map(group => {
            const firstpokemon = group.pokemon[0];
            const lastpokemon = group.pokemon[group.pokemon.length - 1];

            return {
                id: group.id,
                pokemoncount: group.pokemon.length,
                speciesid: firstpokemon?.speciesid,
                species: firstpokemon?.species,
                gender: firstpokemon?.gender,
                ot: firstpokemon?.ot,
                language: firstpokemon?.language,
                firstseen: firstpokemon?.timestamp,
                lastseen: lastpokemon?.timestamp,
                pokemon: group.pokemon.map(p => ({
                    id: p.id,
                    nickname: p.nickname,
                    generation: p.generation,
                    exp: p.exp,
                    evs: p.evs,
                    ivs: p.ivs,
                    legal: p.legal,
                    legalreason: p.legalreason,
                    timestamp: p.timestamp,
                    extractedtime: p.extractedtime,
                    sourcefile: p.save?.filepath || p.sourcepath || 'Individual file',
                    savetimestamp: p.save?.timestamp
                }))
            };
        });
    } catch (error) {
        console.error("[Server/Database] Error getting Pokemon groups:", error);
        throw error;
    }
}

export async function getpokemongroup(groupid: string) {
    try {
        const group = await prismaClient.pokemonGroup.findUnique({
            where: { id: groupid },
            include: {
                pokemon: {
                    orderBy: { timestamp: 'asc' },
                    include: {
                        save: {
                            select: { filepath: true, timestamp: true }
                        }
                    }
                }
            }
        });

        if (!group) {
            throw new Error('Group not found');
        }

        const firstpokemon = group.pokemon[0];

        return {
            id: group.id,
            pokemoncount: group.pokemon.length,
            speciesid: firstpokemon?.speciesid,
            species: firstpokemon?.species,
            gender: firstpokemon?.gender,
            ot: firstpokemon?.ot,
            language: firstpokemon?.language,
            firstseen: firstpokemon?.timestamp,
            lastseen: group.pokemon[group.pokemon.length - 1]?.timestamp,
            pokemon: group.pokemon.map(p => ({
                id: p.id,
                nickname: p.nickname,
                generation: p.generation,
                exp: p.exp,
                evs: p.evs,
                ivs: p.ivs,
                legal: p.legal,
                legalreason: p.legalreason,
                timestamp: p.timestamp,
                extractedtime: p.extractedtime,
                sourcefile: p.save?.filepath || p.sourcepath || 'Individual file',
                savetimestamp: p.save?.timestamp
            }))
        };
    } catch (error) {
        console.error("[Server/Database] Error getting Pokemon group:", error);
        throw error;
    }
}