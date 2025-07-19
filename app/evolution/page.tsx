"use client";

import { useState, useEffect } from "react";
import { sendrequest, getnativename, getlanguagename } from "../lib";
import Loading from "../components/loading";
import Error from "../components/error";
import PokemonTiltedCard from "../components/pokemon-tilted-card";

interface PokemonGroup {
    id: string;
    pokemoncount: number;
    speciesid: number;
    species: any;
    gender: number;
    ot: string;
    language: number;
    firstseen: string;
    lastseen: string;
    pokemon: any[];
}

interface DetailedPokemon {
    id: string;
    nickname?: string;
    generation: number;
    exp: number;
    evs: any;
    ivs: any;
    legal: boolean;
    legalreason?: string;
    timestamp: string;
    extractedtime: string;
    sourcefile: string;
    savetimestamp?: string;
}

export default function PokemonEvolution() {
    const [isloading, setIsloading] = useState(true);
    const [isfailed, setIsfailed] = useState({ status: false, message: "" });
    const [groups, setGroups] = useState<PokemonGroup[]>([]);
    const [selectedgroup, setSelectedgroup] = useState<PokemonGroup | null>(null);
    const [selectedpokemon, setSelectedpokemon] = useState<DetailedPokemon | null>(null);
    const [showoverlay, setShowoverlay] = useState(false);
    const [selecteddupes, setselecteddupes] = useState<number>(1);

    useEffect(() => {
        loadgroups();
    }, []);

    async function loadgroups() {
        try {
            setIsloading(true);
            const response = await sendrequest('/api/data/evolution', 'GET', null);
            if (response && response.groups) {
                setGroups(response.groups);
            } else {
                setIsfailed({ status: true, message: "Invalid response format" });
            }
        } catch (error) {
            setIsfailed({ status: true, message: "Failed to load Pokémon evolution data" });
        } finally {
            setIsloading(false);
        }
    }

    async function createnewgroups() {
        try {
            setIsloading(true);
            const response = await sendrequest('/api/data/generatetrees', 'GET', null);
            if (response && response.groupscreated !== undefined) {
                console.log(`[Client/GET] Generated ${response.groupscreated} evolution trees`);
            }
            await loadgroups();
        } catch (error) {
            setIsfailed({ status: true, message: "Failed to create evolution data" });
        } finally {
            setIsloading(false);
        }
    }

    function handlegroupclick(group: PokemonGroup) {
        setSelectedgroup(group);
        setShowoverlay(true);
    }

    function handlepokemonclick(pokemon: any) {
        setSelectedpokemon(pokemon);
        // Find dupe count for this pokemon
        if (selectedgroup) {
            const grouped = groupduplicates(selectedgroup.pokemon).find(g => g.pokemon.id === pokemon.id);
            setselecteddupes(grouped ? grouped.count : 1);
        }
    }

    function closeoverlay() {
        setShowoverlay(false);
        setSelectedgroup(null);
        setSelectedpokemon(null);
    }

    function groupduplicates(pokemonList: any[]) {
        const groups: { key: string; count: number; pokemon: any }[] = [];
        const map = new Map<string, { count: number; pokemon: any }>();
        for (const pkm of pokemonList) {
            const key = `${pkm.speciesid || ''}_${pkm.nickname || ''}_${pkm.sourcefile || ''}`;
            if (map.has(key)) {
                map.get(key)!.count++;
            } else {
                map.set(key, { count: 1, pokemon: pkm });
            }
        }
        for (const [key, value] of map.entries()) {
            groups.push({ key, count: value.count, pokemon: value.pokemon });
        }
        return groups;
    }

    if (isloading) return <Loading page="evolution" />;
    if (isfailed.status) return <Error page="evolution" error={isfailed.message} />;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="w-auto mx-5">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Pokémon Evolution</h1>
                    <button
                        onClick={createnewgroups}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        Regenerate Evolution Trees
                    </button>
                </div>

                {groups.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400 mb-4">No Pokémon evolution data found.</p>
                        <button
                            onClick={createnewgroups}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            Create Evolution Trees
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-8">
                        {groups.map(group =>
                            <div key={group.id} className="relative flex flex-col items-center m-2">
                                <PokemonTiltedCard
                                    pokemon={{
                                        id: group.id,
                                        species: group.species,
                                        language: group.language,
                                        generation: group.pokemon[0]?.generation || 1,
                                        legal: group.pokemon.every(p => p.legal),
                                        gender: group.gender,
                                        speciesid: group.speciesid,
                                    }}
                                    onclick={() => handlegroupclick(group)}
                                />
                                <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center">
                                    {group.pokemoncount}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {showoverlay && selectedgroup && (
                    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[98vh] overflow-hidden">
                            <div className="p-6 border-b border-gray-700">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold">
                                        {selectedgroup.pokemon[0]?.nickname ||
                                         getnativename(selectedgroup.species, selectedgroup.language)}
                                    </h2>
                                    <button
                                        onClick={closeoverlay}
                                        className="text-gray-400 hover:text-white text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>
                                <p className="text-gray-400 mt-2">
                                    Evolution tree • {selectedgroup.pokemoncount} Pokémon • First seen {new Date(selectedgroup.firstseen).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[85vh]">
                                <div className="flex items-center justify-center mb-0 px-8 py-6">
                                    <div className="flex items-center space-x-6 overflow-x-auto pb-8 pt-8 px-4">
                                        {groupduplicates(selectedgroup.pokemon).map((grouped, index) => (
                                            <div key={grouped.pokemon.id + '-' + grouped.key} className="flex items-center">
                                                <div
                                                    className={`cursor-pointer transition-all flex-shrink-0 ${selectedpokemon?.id === grouped.pokemon.id ? 'scale-110' : 'scale-100'}`}
                                                    onClick={() => handlepokemonclick(grouped.pokemon)}
                                                    style={{ position: 'relative' }}
                                                >
                                                    <PokemonTiltedCard
                                                        pokemon={{
                                                            id: grouped.pokemon.id,
                                                            species: selectedgroup.species,
                                                            nickname: grouped.pokemon.nickname,
                                                            language: selectedgroup.language,
                                                            generation: grouped.pokemon.generation,
                                                            legal: grouped.pokemon.legal,
                                                            gender: selectedgroup.gender,
                                                            speciesid: selectedgroup.speciesid,
                                                        }}
                                                        containerHeight="180px"
                                                        containerWidth="140px"
                                                    />
                                                    {grouped.count > 1 && (
                                                        <div className="absolute -top-3 -right-3 bg-red-600 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center">
                                                            {grouped.count}
                                                        </div>
                                                    )}
                                                </div>
                                                {index < groupduplicates(selectedgroup.pokemon).length - 1 && (
                                                    <div className="text-gray-400 mx-4 text-xl flex-shrink-0">→</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {selectedpokemon && (
                                <div className="bg-gray-700 p-6 max-h-[30vh] overflow-y-auto">
                                    <h3 className="text-lg font-semibold mb-4">Pokémon Details</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-400">Nickname:</span>
                                            <div>{selectedpokemon.nickname || 'None'}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Generation:</span>
                                            <div>{selectedpokemon.generation}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">EXP:</span>
                                            <div>{selectedpokemon.exp.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Legal:</span>
                                            <div className={selectedpokemon.legal ? 'text-green-400' : 'text-red-400'}>
                                                {selectedpokemon.legal ? 'Yes' : 'No'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Source:</span>
                                            <div className="truncate">{selectedpokemon.sourcefile}</div>
                                        </div>
                                        {selectedpokemon.savetimestamp && (
                                            <div>
                                                <span className="text-gray-400">Save Timestamp:</span>
                                                <div>{new Date(selectedpokemon.savetimestamp).toLocaleDateString()}</div>
                                            </div>
                                        )}
                                        {!selectedpokemon.legal && selectedpokemon.legalreason && (
                                            <div className="col-span-full">
                                                <span className="text-gray-400">Illegal Reason:</span>
                                                <div className="text-red-400 text-xs mt-1">{selectedpokemon.legalreason}</div>
                                            </div>
                                        )}
                                        <div className="col-span-full">
                                            <span className="text-gray-400">EVs:</span>
                                            <div className="grid grid-cols-6 gap-2 mt-1 text-xs">
                                                <div>HP: {selectedpokemon.evs?.hp || 0}</div>
                                                <div>ATK: {selectedpokemon.evs?.attack || 0}</div>
                                                <div>DEF: {selectedpokemon.evs?.defense || 0}</div>
                                                <div>SPA: {selectedpokemon.evs?.spatk || 0}</div>
                                                <div>SPD: {selectedpokemon.evs?.spdef || 0}</div>
                                                <div>SPE: {selectedpokemon.evs?.speed || 0}</div>
                                            </div>
                                        </div>
                                        <div className="col-span-full">
                                            <span className="text-gray-400">IVs:</span>
                                            <div className="grid grid-cols-6 gap-2 mt-1 text-xs">
                                                <div>HP: {selectedpokemon.ivs?.hp || 0}</div>
                                                <div>ATK: {selectedpokemon.ivs?.attack || 0}</div>
                                                <div>DEF: {selectedpokemon.ivs?.defense || 0}</div>
                                                <div>SPA: {selectedpokemon.ivs?.spatk || 0}</div>
                                                <div>SPD: {selectedpokemon.ivs?.spdef || 0}</div>
                                                <div>SPE: {selectedpokemon.ivs?.speed || 0}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Original Trainer:</span>
                                            <div>{selectedgroup.ot || 'Unknown'}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Language:</span>
                                            <div>{getlanguagename(selectedgroup.language) || 'Unknown'}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Date Added:</span>
                                            <div>{new Date(selectedpokemon.extractedtime).toLocaleDateString()}</div>
                                        </div>
                                        {selecteddupes > 1 && (
                                            <div className="col-span-full">
                                                <div className="text-red-400">{selecteddupes} duplicates were found in this save.</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
