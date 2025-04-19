// Genuinely, I could've just used tRPC for this, but I gave up.
// Feel free to replace this with tRPC if you want to though (I can't be bothered at the minute, this is painful).

export type TypeFileExtended = File & {
    timestamp?: string;
    parentfolder?: string;
    filedata?: string;
    generation?: number;
    error?: string;
};

/*export type isFailedContent = {
    status: boolean;
    message?: string;
}

export type ErrorResponse = {
    error: string;
};

export type SuccessResponse = {
    success: boolean;
};

export type ApiDataOverviewResponse = {
    count: number;
};

export type ApiVaultGetResponse = {
    data: any[];
};

export type ApiVaultPostRequest = {
    name: string;
    data: any;
    filePath: string;
};

export type ApiVaultPostResponse = {
    success: boolean;
};

export type ApiDataSocketResponse = {
    message: string;
};

export type ApiDataUploadSocketRequest = {
    name?: string;
    data: any;
    timestamp: string;
};

const index = [
    {
        method: 'GET',
        url: '/api/data/overview',
        headers: {
            'Content-Type': 'application/json',
        },
        requesttype: null,
        responsetype: {} as ApiDataOverviewResponse
    },
    {
        method: 'GET',
        url: '/api/vault',
        headers: {
            'Content-Type': 'application/json',
        },
        requesttype: null,
        responsetype: {} as ApiVaultGetResponse
    },
    {
        method: 'POST',
        url: '/api/vault',
        headers: {
            'Content-Type': 'application/json',
        },
        requesttype: {} as ApiVaultPostRequest,
        responsetype: {} as ApiVaultPostResponse
    },
    {
        method: 'SOCKET',
        url: '/api/data/upload',
        headers: {
            'Content-Type': 'application/json',
        },
        requesttype: null,
        responsetype: {} as ApiDataSocketResponse
    },
    {
        method: 'SOCKET',
        url: '/api/data/upload',
        headers: {
            'Content-Type': 'application/json',
        },
        requesttype: {} as ApiDataUploadSocketRequest,
        responsetype: {} as SuccessResponse
    }
];*/

export async function sendrequest(url: string, method: string, content: string | null) {
    /*const request = index.find((req) => req.url === url && req.method === method);
    if (!request) {
        throw new Error('[Client/' + method + '] Invalid request');
    }*/

    //let typedContent: typeof request.requesttype | null = null;

    /*if (typeof request.requesttype !== typeof null) {
        console.log(typeof request.requesttype);
        if (!content) {
            throw new Error('[Client/' + method + '] Content is required for this request');
        }
    
        try {
            const parsedContent = JSON.parse(content!);
            typedContent = parsedContent as typeof request.requesttype;
        } catch {
            throw new Error('[Client/' + method + '] Content does not match the expected type for ' + url + ', got: ' + typeof content);
        }
    } else {
        if (content) {
            throw new Error('[Client/' + method + '] Content is not allowed for this request');
        }
    }*/
    
    const response = await fetch(url, {
        method,
        //headers: request.headers,
        headers: {
            'Content-Type': 'application/json',
        },
        //body: typedContent ? JSON.stringify(typedContent) : null,
        body: content,
    });
    if (!response.ok) {
        throw new Error('[Client/' + method + '] ' + await response.text());
    }
    const jsonResponse = await response.json();
    /*try {
        if ('success' in jsonResponse) {
            const successResponse = jsonResponse as SuccessResponse;
            return successResponse;
        }
        const typedResponse = jsonResponse as typeof request.responsetype;
        return typedResponse;
    } catch {
        try {
            const errorResponse = jsonResponse as ErrorResponse;
            throw new Error(errorResponse.error);
        } catch {
            throw new Error('[Client/' + method + '] Response does not match the expected type for ' + url + ', got: ' + typeof jsonResponse);
        }
    }*/
   return jsonResponse;
};

export async function opensocket<TInput, TOutput>(url: string) {
    /*const request = index.find((req) => req.url === url && req.method === 'SOCKET');
    if (!request) {
        throw new Error('[Client/SOCKET] Invalid request');
    }*/

    const socket = new WebSocket(url);

    return new Promise<{
        send: (data: TInput) => void;
        onMessage: (callback: (data: TOutput) => void) => void;
        close: () => void;
    }>((resolve, reject) => {
        socket.onopen = () => {
            resolve({
                send: (data: TInput) => {
                    /*try {
                        const typedData = data as typeof request.requesttype;
                        socket.send(JSON.stringify(typedData));
                    } catch {
                        throw new Error('[Client/SOCKET] Data does not match the expected input type for ' + url + ', got: ' + typeof data);
                    }*/
                    socket.send(JSON.stringify(data));
                },
                onMessage: (callback: (data: TOutput) => void) => {
                    socket.onmessage = (event) => {
                        /*try {
                            const parsedData = JSON.parse(event.data);
                            if ('error' in parsedData) {
                                const errorResponse = parsedData as ErrorResponse;
                                callback(errorResponse as TOutput);
                            } else if ('success' in parsedData) {
                                const successResponse = parsedData as SuccessResponse;
                                callback(successResponse as TOutput);
                            } else {
                                const typedData = parsedData as typeof request.responsetype;
                                callback(typedData as TOutput);
                            }
                        } catch {
                            throw new Error('[Client/SOCKET] Response does not match the expected type for ' + url + ', got: ' + typeof event.data);
                        }*/
                        const parsedData = JSON.parse(event.data);
                        callback(parsedData as TOutput);
                    };
                },
                close: () => {
                    socket.close();
                },
            });
        };

        socket.onerror = (error) => {
            reject(new Error('[Client/SOCKET] WebSocket error: ' + error));
        };

        socket.onclose = () => {
            console.log('[Client/SOCKET] WebSocket connection closed');
        };
    });
}