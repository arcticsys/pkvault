"use client";

import { useState, useEffect } from "react";
import Failed from "../components/error";
import Loading from "../components/loading";
import { sendrequest } from "../lib";

interface PokemonData {
    id: string;
    displayname: string;
    nativename: string;
    languageflag: string;
    pokemonimageurl: string;
    nickname?: string;
    speciesid: number;
    generation: number;
    gender: number;
    legal: boolean;
    ot: string;
    sourcefile: string;
    extractedtime: string;
    savetimestamp?: string;
}

const PAGE_SIZE = 50;

export default function Vault() {
    const [isLoading, setIsLoading] = useState(true);
    const [isFailed, setIsFailed] = useState({ status: false, message: "" });
    const [items, setItems] = useState<PokemonData[]>([]);
    const [selectedPokemon, setSelectedPokemon] = useState<PokemonData | null>(null);
    const [offset, setOffset] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadInitial();
    }, []);

    async function loadInitial() {
        setIsLoading(true);
        const response = await sendrequest('/api/vault?page=' + offset + '&limit=' + PAGE_SIZE, 'GET');
        setIsLoading(false);
        if ('data' in response && Array.isArray(response.data)) {
            setItems(response.data);
            setOffset(2);
            setHasMore(response.data.length === PAGE_SIZE);
        } else {
            setIsFailed({ status: true, message: "Invalid data format" });
        }
    }

    async function loadMore() {
        const response = await sendrequest('/api/vault?page=' + offset + '&limit=' + PAGE_SIZE, 'GET');
        if ('data' in response && Array.isArray(response.data)) {
            setItems(prev => [...prev, ...response.data]);
            setOffset(prev => prev + 1);
            setHasMore(response.data.length === PAGE_SIZE);
        }
    }

    if (isFailed.status) {
        return (
            <Failed page="vault" error={isFailed.message || "Unspecified error"} />
        );
    }

    if (isLoading) {
        return (
            <Loading page="vault" />
        );
    } else if (!isLoading && !isFailed.status) {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Vault</h1>
                    <button
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
                        onClick={async () => {
                            setIsLoading(true);
                            let allPokemon: PokemonData[] = [];
                            let page = 1;
                            let keepLoading = true;
                            while (keepLoading) {
                                const response = await sendrequest('/api/vault?page=' + page + '&limit=' + PAGE_SIZE, 'GET');
                                if ('data' in response && Array.isArray(response.data)) {
                                    allPokemon = allPokemon.concat(response.data);
                                    if (response.data.length < PAGE_SIZE) {
                                        keepLoading = false;
                                    } else {
                                        page++;
                                    }
                                } else {
                                    setIsFailed({ status: true, message: "Invalid data format" });
                                    keepLoading = false;
                                }
                            }
                            setItems(allPokemon);
                            setOffset(allPokemon.length);
                            setHasMore(false);
                            setIsLoading(false);
                        }}
                    >
                        Load All
                    </button>
                </div>

                { items.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-2">
                            Looks like you haven't added any Pokémon to your vault yet.
                        </div>
                        <div className="text-gray-400">
                            You can add Pokémon to your vault by using the "Upload Save(s)" button!
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-gray-400">
                            Showing {items.length} Pokémon
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                            {items.map((pokemon) => (
                                <div
                                    key={pokemon.id}
                                    className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-105"
                                    onClick={() => setSelectedPokemon(pokemon)}
                                >
                                    <div className="aspect-square bg-gray-700 flex items-center justify-center">
                                        <img
                                            src={pokemon.pokemonimageurl}
                                            alt={pokemon.nativename}
                                            className="max-w-full max-h-full object-contain"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" fill="%23374151"/><circle cx="48" cy="48" r="20" fill="%236B7280"/><circle cx="42" cy="42" r="3" fill="white"/><circle cx="54" cy="42" r="3" fill="white"/><path d="M40 58 Q48 64 56 58" stroke="white" stroke-width="2" fill="none"/></svg>`;
                                            }}
                                        />
                                    </div>
                                    <div className="p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-white font-medium text-sm truncate">
                                                {pokemon.displayname}
                                            </span>
                                            <span className="text-xs">{pokemon.languageflag}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-300">
                                            <span>Gen {pokemon.generation}</span>
                                            <div className="flex items-center gap-1">
                                                {pokemon.legal ? (
                                                    <span className="text-green-400">✓</span>
                                                ) : (
                                                    <span className="text-red-400">⚠</span>
                                                )}
                                                <span className="text-gray-500">#{pokemon.speciesid}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {hasMore && (
                            <div className="flex justify-center mt-6">
                                <button
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
                                    onClick={loadMore}
                                >
                                    Load More
                                </button>
                            </div>
                        )}
                    </>
                )}

                {selectedPokemon && (
                    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
                            <div className="p-6 border-b border-gray-700">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold">{selectedPokemon.displayname}</h2>
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
                                            (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" fill="%23374151"/><circle cx="48" cy="48" r="20" fill="%236B7280"/><circle cx="42" cy="42" r="3" fill="white"/><circle cx="54" cy="42" r="3" fill="white"/><path d="M40 58 Q48 64 56 58" stroke="white" stroke-width="2" fill="none"/></svg>`;
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
        );
    }
}