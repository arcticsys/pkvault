"use client";

import { useState } from 'react';

interface TiltedCardProps {
    pokemon: any;
    onClick: () => void;
}

export default function TiltedCard({ pokemon, onClick }: TiltedCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    const getpokemonimage = (speciesid: number) => {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesid}.png`;
    };

    const getstatcolor = (statvalue: number, maxstat: number = 255) => {
        const percentage = (statvalue / maxstat) * 100;
        if (percentage >= 80) return 'text-green-400';
        if (percentage >= 60) return 'text-yellow-400';
        if (percentage >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <div className={`
                relative w-64 h-80 rounded-xl overflow-hidden transition-all duration-300 transform
                ${isHovered ? 'scale-105 rotate-1' : 'rotate-2'}
                shadow-lg hover:shadow-2xl
            `}>
                <div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-80"
                    style={{
                        backgroundImage: `url(${getpokemonimage(pokemon.speciesid)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: isHovered ? 'brightness(0.3)' : 'brightness(0.7)'
                    }}
                />

                <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold truncate">
                                {pokemon.nickname || pokemon.species[2] || `#${pokemon.speciesid}`}
                            </h3>
                            <span className="text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                                Gen {pokemon.generation}
                            </span>
                        </div>

                        <div className="text-sm opacity-90 mb-2">
                            OT: {pokemon.ot}
                        </div>

                        {!pokemon.legal && (
                            <div className="text-red-400 text-sm">⚠ Illegal</div>
                        )}
                    </div>

                    {isHovered && (
                        <div className="bg-black bg-opacity-60 rounded-lg p-3 space-y-1 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                                <div>HP: <span className={getstatcolor(pokemon.ivs.hp, 31)}>{pokemon.ivs.hp}</span></div>
                                <div>Att: <span className={getstatcolor(pokemon.ivs.attack, 31)}>{pokemon.ivs.attack}</span></div>
                                <div>Def: <span className={getstatcolor(pokemon.ivs.defense, 31)}>{pokemon.ivs.defense}</span></div>
                                <div>SpA: <span className={getstatcolor(pokemon.ivs.spatk, 31)}>{pokemon.ivs.spatk}</span></div>
                                <div>SpD: <span className={getstatcolor(pokemon.ivs.spdef, 31)}>{pokemon.ivs.spdef}</span></div>
                                <div>Spe: <span className={getstatcolor(pokemon.ivs.speed, 31)}>{pokemon.ivs.speed}</span></div>
                            </div>
                            <div className="text-center mt-2 text-gray-300">
                                Click to view timeline
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
