export type TypeFileExtended = File & {
    timestamp?: string;
    parentfolder?: string;
    filedata?: string;
    generation?: number;
    error?: string;
    hash?: string;
    status: number;
};

export async function gethash(data: string): Promise<string> {
    const msg = new TextEncoder().encode(data);
    const hashbuf = await crypto.subtle.digest('SHA-256', msg);
    const hasharr = Array.from(new Uint8Array(hashbuf));
    const hash = hasharr.map(b => b.toString(16).padStart(2, '0')).join('');
    return hash;
}

export async function sendrequest(url: string, method: string, content: string | null) {
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: content,
    });
    if (!response.ok) {
        throw new Error('[Client/' + method + '] ' + await response.text());
    }
    const jsonResponse = await response.json();
   return jsonResponse;
};

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