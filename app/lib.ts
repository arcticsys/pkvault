export type TypeFileExtended = File & {
    timestamp?: string;
    parentfolder?: string;
    filedata?: string;
    generation?: number;
    error?: string;
    hash?: string;
    status: number;
    file?: File;
};

export type PokemonSpeciesName = {
    0: string; // Hacked or Gen 5 Japanese trade, we'll just assume an English origin, and maybe let the user later change it if it is from a trade? (Route this to Name 2)
    1: string; // Japanese (日本語)
    2: string; // English (US/UK/AU)
    3: string; // French (Français)
    4: string; // Italian (Italiano)
    5: string; // German (Deutsch)
    6: string; // Unused, expect this to be blank, or maybe it'll be used in future games. Who knows? (Route this to Name 2)
    7: string; // Spanish (Español)
    8: string; // Korean (한국어)
    9: string; // Chinese Simplified (简体中文)
    10: string; // Chinese Traditional (繁體中文)
}

export function canwedogotolgpe(speciesid: number, form: number): boolean {
    if (((speciesid >= 1 && speciesid <= 151) || speciesid === 808 || speciesid === 809) && speciesid !== 151) {
        const alolanspecies = [19, 20, 26, 27, 28, 37, 38, 50, 51, 52, 53, 74, 75, 76, 88, 89, 103, 105];
        if (alolanspecies.includes(speciesid)) {
            return form === 0 || form === 1;
        } else {
            return true;
        }
    }
    return false;
}

export async function gethash(data: string): Promise<string> {
    const msg = new TextEncoder().encode(data);
    const hashbuf = await crypto.subtle.digest('SHA-256', msg);
    const hasharr = Array.from(new Uint8Array(hashbuf));
    return hasharr.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function sendrequest(url: string, method: string, content?: string | null) {
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: content,
    });
    if (!response.ok) {
        return Error('[Client/' + method + '] ' + await response.text());
    }
    return await response.json();
}

export async function opensocket<TInput, TOutput>(url: string) {
    const properurl = url.startsWith('ws://') || url.startsWith('wss://')
        ? url
        : `${typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss://' : 'ws://'}${typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}${url}`;

    console.log('Constructed WebSocket URL:', properurl);

    return new Promise<{
        send: (data: TInput) => void;
        onMessage: (callback: (data: TOutput) => void) => void;
        onClose: (callback: (event: CloseEvent) => void) => void;
        close: () => void;
    }>((resolve, reject) => {
        try {
            const socket = new WebSocket(properurl);
            const timeout = setTimeout(() => {
                console.error('[Client/SOCKET] WebSocket connection timed out');
                reject(new Error('[Client/SOCKET] WebSocket connection timed out'));
            }, 10000);

            socket.onopen = () => {
                clearTimeout(timeout);

                resolve({
                    send: (data: TInput) => {
                        try {
                            socket.send(JSON.stringify(data));
                        } catch (err) {
                            console.error('[Client/SOCKET] Error sending data:', err);
                            throw new Error('[Client/SOCKET] Failed to send data: ' + err);
                        }
                    },
                    onMessage: (callback: (data: TOutput) => void) => {
                        socket.onmessage = (event) => {
                            try {
                                const parsedData = JSON.parse(
                                    typeof event.data === 'string'
                                        ? event.data
                                        : Array.isArray(event.data)
                                        ? Buffer.concat(event.data).toString()
                                        : new TextDecoder().decode(event.data)
                                );
                                console.log('[Client/SOCKET] Parsed data:', parsedData);
                                callback(parsedData as TOutput);
                            } catch (err) {
                                console.error('[Client/SOCKET] Error parsing message:', err, event.data);
                            }
                        };
                    },
                    onClose: (callback: (event: CloseEvent) => void) => {
                        socket.onclose = (event) => {
                            console.log('[Client/SOCKET] WebSocket connection closed');
                            callback(event);
                        };
                    },
                    close: () => {
                        socket.close();
                    },
                });
            };

            socket.onerror = (error) => {
                console.error('[Client/SOCKET] WebSocket error:', error);
                clearTimeout(timeout);
                reject(new Error('[Client/SOCKET] WebSocket error'));
            };
        } catch (err) {
            console.error('[Client/SOCKET] Error creating WebSocket:', err);
            reject(new Error('[Client/SOCKET] Failed to create WebSocket: ' + err));
        }
    });
}

export function getnativename(species: PokemonSpeciesName, language: number): string {
    let targetlang = language;

    if (targetlang === 0 || targetlang === 6) {
        targetlang = 2;
    }

    const name = species[targetlang as keyof PokemonSpeciesName];

    if (!name || name.trim() === '') {
        return species[2] || 'Unknown';
    }

    return name;
}

export function getlanguagename(languageindex: number): string {
    const languages: { [key: number]: string } = {
        0: 'Hacked/Unknown',
        1: '日本語',
        2: 'English',
        3: 'Français',
        4: 'Italiano',
        5: 'Deutsch',
        6: 'Unused',
        7: 'Español',
        8: '한국어',
        9: '简体中文',
        10: '繁體中文'
    };
    return languages[languageindex] || 'Unknown';
}

export function getlanguageflag(languageindex: number): string {
    const flags: { [key: number]: string } = {
        0: '❓',
        1: '🇯🇵',
        2: '🇬🇧',
        3: '🇫🇷',
        4: '🇮🇹',
        5: '🇩🇪',
        6: '❓',
        7: '🇪🇸',
        8: '🇰🇷',
        9: '🇨🇳',
        10: '🇹🇼'
    };
    return flags[languageindex] || '❓';
}