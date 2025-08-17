"use client";

import PokemonTiltedCard from "@/app/components/pokemon-tilted-card";
import { useEffect, useState } from "react";

interface Save {
    id: string;
    filepath: string;
    timestamp: string;
    extractedtime: string;
    pokemonCount: number;
}

interface GroupedPokemon {
    speciesid: number;
    species: any;
    count: number;
    pokemon: any[];
}

export default function BackupsPage() {
    const [saves, setSaves] = useState<Save[]>([]);
    const [selectedSave, setSelectedSave] = useState<Save | null>(null);
    const [groupedPokemon, setGroupedPokemon] = useState<GroupedPokemon[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPokemon, setSelectedPokemon] = useState<any | null>(null);

    useEffect(() => {
        async function fetchSaves() {
            setLoading(true);
            const res = await fetch("/api/backups/saves");
            const data = await res.json();
            setSaves(data.saves);
            setLoading(false);
        }
        fetchSaves();
    }, []);

    async function handleSaveClick(save: Save) {
        setSelectedSave(save);
        setLoading(true);
        const res = await fetch(`/api/backups/save-pokemon?id=${save.id}`);
        const data = await res.json();
        setGroupedPokemon(data.groupedPokemon);
        setLoading(false);
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Backups</h1>
            {loading && <div>Loading...</div>}
            {!selectedSave ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {saves.map((save) => (
                        <div
                            key={save.id}
                            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-105 flex flex-col justify-between"
                            onClick={() => handleSaveClick(save)}
                        >
                            <div className="aspect-square bg-gray-700 flex items-center justify-center">
                                <span className="text-xs text-gray-300 break-words p-2 w-full text-center" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{save.filepath}</span>
                            </div>
                            <div className="p-3 flex flex-col items-end">
                                <span className="bg-gray-700 text-white px-2 py-1 rounded text-xs w-full text-center mt-2">{save.pokemonCount} Pokémon</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    <button
                        className="mb-4"
                        onClick={() => setSelectedSave(null)}
                    >
                        ← Back to saves
                    </button>
                    <h2 className="text-xl font-bold mb-2">Pokémon in {selectedSave.filepath}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                        {groupedPokemon.map((group) => (
                            group.pokemon.length > 0 && (
                                <div
                                    key={group.pokemon[0].id || group.speciesid}
                                    className="cursor-pointer"
                                    onClick={() => setSelectedPokemon(group.pokemon[0])}
                                >
                                    <PokemonTiltedCard pokemon={group.pokemon[0]} />
                                </div>
                            )
                        ))}
                    </div>
                    {selectedPokemon && (
                        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
                            <div className="bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
                                <div className="p-6 border-b border-gray-700">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold">{selectedPokemon.nickname || selectedPokemon.displayname}</h2>
                                        <button
                                            onClick={() => setSelectedPokemon(null)}
                                            className="text-gray-400 hover:text-white text-2xl"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    {(selectedPokemon.nickname !== selectedPokemon.nativename) && (
                                        <p className="text-gray-400">({selectedPokemon.nativename})</p>
                                    )}
                                </div>
                                <div className="p-6 overflow-y-auto">
                                    <div className="text-center mb-6">
                                        <img
                                            src={selectedPokemon.pokemonimageurl}
                                            alt={selectedPokemon.nativename}
                                            className="mx-auto max-w-32 max-h-32"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'><rect width='96' height='96' fill='%23374151'/><circle cx='48' cy='48' r='20' fill='%236B7280'/><circle cx='42' cy='42' r='3' fill='white'/><circle cx='54' cy='42' r='3' fill='white'/><path d='M40 58 Q48 64 56 58' stroke='white' stroke-width='2' fill='none'/></svg>`;
                                            }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-400">Species ID:</span>
                                            <div>#{selectedPokemon.speciesid}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Generation:</span>
                                            <div>{selectedPokemon.generation}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Gender:</span>
                                            <div>{selectedPokemon.gender === 0 ? '♂ Male' : selectedPokemon.gender === 1 ? '♀ Female' : '⚬ Genderless'}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Legal:</span>
                                            <div className={selectedPokemon.legal ? 'text-green-400' : 'text-red-400'}>
                                                {selectedPokemon.legal ? 'Yes' : 'No'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Original Trainer:</span>
                                            <div>{selectedPokemon.ot}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Source:</span>
                                            <div className="text-xs truncate">{selectedPokemon.sourcefile}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Added:</span>
                                            <div>{new Date(selectedPokemon.extractedtime).toLocaleString()}</div>
                                        </div>
                                        {selectedPokemon.savetimestamp && (
                                            <div>
                                                <span className="text-gray-400">Save Timestamp:</span>
                                                <div>{new Date(selectedPokemon.savetimestamp).toLocaleString()}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
