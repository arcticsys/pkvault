"use client";

import type { SpringOptions } from "framer-motion";
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { getnativename, getlanguageflag, PokemonSpeciesName } from "@/app/lib";

interface PokemonTiltedCardProps {
  pokemon: {
    id: string;
    species: PokemonSpeciesName;
    nickname?: string;
    language: number;
    generation: number;
    legal: boolean;
    gender: number;
    speciesid: number;
  };
  onhover?: (pokemon: any) => void;
  onclick?: (pokemon: any) => void;
  containerHeight?: React.CSSProperties["height"];
  containerWidth?: React.CSSProperties["width"];
  scaleOnHover?: number;
  rotateAmplitude?: number;
}

const springValues: SpringOptions = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

export default function PokemonTiltedCard({
  pokemon,
  onhover,
  onclick,
  containerHeight = "200px",
  containerWidth = "160px",
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
}: PokemonTiltedCardProps) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);
  const [ishovered, setIshovered] = useState(false);

  const nativename = getnativename(pokemon.species, pokemon.language);
  const displayname = pokemon.nickname || nativename;
  const languageflag = getlanguageflag(pokemon.language);

  const pokemonimageurl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.speciesid}.png`;

  function handlemouse(e: React.MouseEvent<HTMLElement>) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  }

  function handlemouseenter() {
    scale.set(scaleOnHover);
    opacity.set(1);
    setIshovered(true);
    if (onhover) {
      onhover(pokemon);
    }
  }

  function handlemouseleave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    setIshovered(false);
  }

  function handleclick() {
    if (onclick) {
      onclick(pokemon);
    }
  }

  return (
    <figure
      ref={ref}
      className="relative w-full h-full [perspective:800px] flex flex-col items-center justify-center cursor-pointer"
      style={{
        height: containerHeight,
        width: containerWidth,
      }}
      onMouseMove={handlemouse}
      onMouseEnter={handlemouseenter}
      onMouseLeave={handlemouseleave}
      onClick={handleclick}
    >
      <motion.div
        className="relative [transform-style:preserve-3d] bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg overflow-hidden shadow-lg"
        style={{
          width: containerWidth,
          height: containerHeight,
          rotateX,
          rotateY,
          scale,
        }}
      >
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            ishovered ? 'opacity-40' : 'opacity-0'
          }`}
        />

        <div className="relative h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={pokemonimageurl}
              alt={nativename}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" fill="%23374151"/><circle cx="48" cy="48" r="20" fill="%236B7280"/><circle cx="42" cy="42" r="3" fill="white"/><circle cx="54" cy="42" r="3" fill="white"/><path d="M40 58 Q48 64 56 58" stroke="white" stroke-width="2" fill="none"/></svg>`;
              }}
            />
          </div>

          <div className="p-3 bg-gray-900 bg-opacity-80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-medium text-sm truncate">
                {displayname}
              </span>
              <span className="text-xs">{languageflag}</span>
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

        {ishovered && (
          <motion.div
            className="absolute inset-0 z-[2] w-full h-full flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-gray-700 bg-opacity-80 text-white p-3 rounded text-xs text-center w-full h-full flex flex-col justify-center">
              <div className="font-medium mb-1">{displayname}</div>
              {pokemon.nickname && (
                <div className="text-gray-300 mb-1">({nativename})</div>
              )}
              <div className="text-gray-400">
                Species #{pokemon.speciesid}
              </div>
              <div className="text-gray-400">
                Gen {pokemon.generation}
              </div>
              <div className="text-gray-400">
                {pokemon.legal ? 'Legal' : 'Illegal'}
              </div>
                <div className={
                  [
                    "flex",
                    "items-center",
                    "justify-center",
                    "gap-1",
                    pokemon.gender === 0 ? "text-blue-400" : pokemon.gender === 1 ? "text-pink-400" : "text-white"
                  ].join(" ")
                }>
                <span style={
                  {
                    paddingRight:0
                  }
                }>
                {pokemon.gender === 0 ? "Male" : pokemon.gender === 1 ? "Female" : "Genderless"}
                </span>
                <span className="text-lg font-bold" style={
                  {
                    paddingRight:0
                  }
                }>
                {pokemon.gender === 0 ? "♂" : pokemon.gender === 1 ? "♀" : "⚬"}
                </span>
                </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </figure>
  );
}
