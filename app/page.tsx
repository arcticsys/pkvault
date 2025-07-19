"use client";

import { useState, useEffect } from "react";
import Failed from "./components/error";
import Loading from "./components/loading";
import { sendrequest, getnativename, getlanguageflag, PokemonSpeciesName } from "./lib";

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const [isFailed, setIsFailed] = useState({ status: false, message: "" });
    const [Content, setContent] = useState({
        pokemoncount: 0,
        savecount: 0,
        recentpokemon: []
    });

    useEffect(() => {
        sendrequest('/api/data/overview', 'GET', null)
            .then((response) => {
                setIsLoading(false);
                if (response && "pokemoncount" in response && typeof response.pokemoncount === "number") {
                    setContent(response);
                } else {
                    setIsFailed({ status: true, message: "Invalid data format" });
                }
            })
            .catch(error => {
                setIsFailed({ status: true, message: error.message });
                setIsLoading(false);
            });
    }, []);

    if (isFailed.status) {
        return (
            <Failed page="home" error={isFailed.message || "Unspecified error"} />
        );
    }

    if (isLoading) {
        return (
            <Loading page="home" />
        );
    }

    return (
        <div>
            <h1 className="text-3xl">Welcome to PKVault</h1>
            <p className="mt-4">Select an option from the sidebar to get started.</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded">
                    <h3 className="text-lg font-semibold">Total Pokémon: {Content.pokemoncount}</h3>
                </div>
                <div className="bg-gray-800 p-4 rounded">
                    <h3 className="text-lg font-semibold">Save Files: {Content.savecount}</h3>
                </div>
            </div>
            {Content.recentpokemon && Content.recentpokemon.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Recently Added Pokémon</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-800 rounded-lg">
                            <thead>
                                <tr className="bg-gray-700">
                                    <th className="px-4 py-2 text-left">Name</th>
                                    <th className="px-4 py-2 text-left">Generation</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                    <th className="px-4 py-2 text-left">Source</th>
                                    <th className="px-4 py-2 text-left">Date Added</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Content.recentpokemon.map((pokemon: any, index: number) => {
                                    const nativename = getnativename(pokemon.species as PokemonSpeciesName, pokemon.language);
                                    const displayname = pokemon.nickname || nativename;

                                    return (
                                        <tr key={index} className="border-t border-gray-600">
                                            <td className="px-4 py-2">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{displayname}</span>
                                                        <span className="text-sm">{getlanguageflag(pokemon.language)}</span>
                                                        {pokemon.nickname && displayname !== nativename && (
                                                            <span className="text-sm text-gray-400">({nativename})</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-gray-400">Gen{pokemon.generation}</td>
                                            <td className="px-4 py-2">
                                                {pokemon.legal ? (
                                                    <span className="text-green-400">✓ Legal</span>
                                                ) : (
                                                    <span className="text-red-400">⚠ Illegal</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-gray-400 text-sm">
                                                {pokemon.sourcefile.length > 30
                                                    ? '...' + pokemon.sourcefile.slice(-27)
                                                    : pokemon.sourcefile
                                                }
                                            </td>
                                            <td className="px-4 py-2 text-gray-400 text-sm">
                                                {new Date(pokemon.extractedtime).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}