import { prismaClient } from "./databases";

export async function handlesave(save: any, extractedtime: number) {
    try {
        const result = await prismaClient.save.create({
            data: save.data,

            extractedtime,
        });
        return result;
    } catch (error) {
        console.error("[Server/Database] Error storing save:", error);
        throw error;
    }
}

export async function storepokemon(pokemon: object, extractedtime: number) {
    try {
        const result = await prismaClient.pokemon.create({
        data: {
            ...pokemon,
            extractedtime
        },
        });
        return result;
    } catch (error) {
        console.error("[Server/Database] Error storing Pokemon:", error);
        throw error;
    }
}