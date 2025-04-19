import { PrismaClient } from '@prisma/client';

declare global {
    var prismaClient: PrismaClient | undefined;
}

export const prismaClient = global.prismaClient || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    global.prismaClient = prismaClient;
}

async function tryInitializeDatabase(client: any, name: string) {
    try {
        await client.$connect();
        console.log(`${name} connection established successfully`);
    } catch (error) {
        console.log(`Failed to connect to ${name}, attempting to initialize it...`);
        try {
            await client.$executeRaw`CREATE DATABASE IF NOT EXISTS ${name}`;
            await client.$migrate.deploy();
            console.log(`${name} initialized successfully`);
        } catch (initError) {
            console.error(`Failed to initialize ${name}:`, initError);
            throw initError;
        }
    }
}

export async function initDatabases() {
    console.log('Initializing database connections...');
    try {
        await tryInitializeDatabase(prismaClient, 'db');
        console.log('All database connections established successfully');
    } catch (error) {
        console.error('Failed to connect to databases:', error);
        throw error;
    } finally {
        await prismaClient.$disconnect();
    }
}