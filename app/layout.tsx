import './globals.css';
import React from 'react';
import type { Metadata } from 'next';
import Sidebar from './components/sidebar';

export const metadata: Metadata = {
    title: 'PKVault',
    description: 'Immutable Pokémon storage for Gens I to IX',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body style={{ padding: '10px 10px 10px 0' }}>
                <div className="flex" style={{ padding: '0 10px 0 0' }}>
                    <Sidebar />
                    <main className="flex-1 p-4 ml-1" style={{ padding: '0 0 0 10px', marginLeft: '200px' }}>
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
};