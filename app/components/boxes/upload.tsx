'use client';

import React from 'react';
import { BoxManager } from '../box';
import { TypeFileExtended, opensocket, gethash, sendrequest } from '@/app/lib';
import { createRoot } from 'react-dom/client';
import { getgencolour, getuploadtypecolour } from '../colours';

function filescomp(files: TypeFileExtended[], setfiles: React.Dispatch<React.SetStateAction<TypeFileExtended[]>>, uploadlocked: boolean) {
    return (
        <div>
            {files.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')).map((file, index) => (
                <div
                    key={index}
                    data-file={file.name}
                    className="file"
                    style={{
                        position: 'relative',
                        paddingTop: '8px',
                        paddingBottom: '12px',
                        paddingLeft: '8px',
                        paddingRight: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: file.generation ? getgencolour(file.generation) : '#ffffff',
                    }}
                >
                    <span>
                        {file.webkitRelativePath ? file.webkitRelativePath : file.name}
                        {!file.error && (
                            <>
                                <br />
                                Seen at {new Date(file.lastModified).toLocaleString()}{file.generation && (`- Generation: ${file.generation}`)}
                            </>
                        )}
                        {file.error && (
                            <>
                                <br />
                                Error: {file.error}
                            </>
                        )}
                    </span>
                    {!uploadlocked && (
                        <button
                            style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0px',
                                margin: '0px',
                            }}
                            onClick={() => {
                                setfiles((prevfiles: TypeFileExtended[]) => prevfiles.filter((_, i: number) => i !== index));
                            }}
                        >
                            
                        </button>
                    )}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '5px',
                            left: '5px',
                            right: '5px',
                            height: '5px',
                            backgroundColor: file.status === 1 ? '#f44336' : '#444',
                            borderRadius: '2.5px',
                            overflow: 'hidden',
                        }}
                        id="progressbar"
                    >
                        <div
                            style={{
                                width: '0%',
                                height: '100%',
                                backgroundColor: file.status === 1 ? 'transparent' : '#4caf50',
                                borderRadius: '2.5px',
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function updatebars(files: TypeFileExtended[]) {
    files.forEach(file => {
        const fileelement = document.querySelector(`[data-file="${file.name}"]`);
        if (fileelement) {
            const progressbar = fileelement.querySelector('#progressbar div');
            if (progressbar) {
                if (file.status === 1) {
                    progressbar.setAttribute('style', `width: 0%; height: 100%; background-color: #FF0000; border-radius: 2.5px;`);
                } else if (file.status === 2) {
                    progressbar.setAttribute('style', `width: 100%; height: 100%; background-color: #4caf50; border-radius: 2.5px;`);
                } else if (file.status === 0) {
                    progressbar.setAttribute('style', `width: 0%; height: 100%; background-color: #444; border-radius: 2.5px;`);
                } else if (typeof file.status === 'number' && file.status > 2) {
                    progressbar.setAttribute('style', `width: ${file.status - 2}%; height: 100%; background-color: #4caf50; border-radius: 2.5px;`);
                }
            }
        }
    });
}

export default function Upload() {
    const [uploadtype, setuploadtype] = React.useState(0);
    const [files, setfiles] = React.useState<TypeFileExtended[]>([]);
    const [uploadlocked, setuploadlocked] = React.useState(false);
    const [uploadsock, setuploadsock] = React.useState<WebSocket | null>(null);
    const [uploadfinished, setuploadfinished] = React.useState(false);
    const [serenitystatus, setserenitystatus] = React.useState<Boolean | null>(null);
    let filesroot = React.useRef<ReturnType<typeof createRoot> | null>(null);
    let uploaderrors = React.useRef<string | null>(null);

    React.useEffect(() => {
        const element = document.getElementById('files');
        if (element) {
            const probablyfilesroot = element.querySelector('div');
            if (!filesroot.current || !probablyfilesroot) {
                filesroot.current = createRoot(element);
            }
            if (filesroot.current) {
                filesroot.current.render(filescomp(files, setfiles, uploadlocked));
            }
        }
    }, [files, uploadtype, uploadlocked]);

    React.useEffect(() => {
        if (uploadlocked) {
            BoxManager.disableclose();
        } else {
            BoxManager.enableclose();
        }
    }, [uploadlocked]);

    React.useEffect(() => {
        if (serenitystatus === true) return;
        const checkserenity = () => {
            sendrequest('/api/data/serenity', 'GET', null)
                .then((response) => {
                    if (response.status === 200) {
                        setserenitystatus(true);
                    } else {
                        setserenitystatus(false);
                    }
                })
                .catch((error) => {
                    console.error('[Client/Upload] Failed to check servers connection with Serenity:', error);
                    setserenitystatus(false);
                });
        };
        checkserenity();
        const interval = setInterval(() => {
            if (serenitystatus !== true) {
                checkserenity();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [serenitystatus]);

    React.useEffect(() => {
        updatebars(files);
    }, [files]);

    return (
        <div>
            <h1>Upload Save(s)</h1>
            <div style={{ display: uploadlocked ? 'none' : 'block' }}>It's highly recommended to use FTP as you'll get accurate times displayed in your vault</div>
            {serenitystatus === null && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>Checking connection with Serenity...</div>
            )}
            {serenitystatus === false && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', color: 'red'}}>Serenity is offline. Perhaps the server is still starting?</div>
            )}
            {!uploadlocked && (
                <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', padding: '0px', whiteSpace: 'nowrap' }}>
                    <button
                        className="chip"
                        style={{
                            backgroundColor: uploadtype === 1 ? getuploadtypecolour('file', true, false) : getuploadtypecolour('file', false, false),
                            color: '#000000',
                        }}
                        onClick={() => setuploadtype(1)}
                        onMouseEnter={(e) => {
                            if (uploadtype !== 1) {
                                e.currentTarget.style.backgroundColor = getuploadtypecolour('file', false, true);
                            }
                        }}
                        onMouseMove={(e) => {
                            if (uploadtype !== 1) {
                                e.currentTarget.style.backgroundColor = getuploadtypecolour('file', false, true);
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (uploadtype !== 1) {
                                e.currentTarget.style.backgroundColor = getuploadtypecolour('file', false, false);
                            }
                        }}
                    >
                        File
                    </button>
                    <button
                        className="chip"
                        style={{
                            backgroundColor: uploadtype === 2 ? getuploadtypecolour('folder', true, false) : getuploadtypecolour('folder', false, false),
                            color: '#000000',
                        }}
                        onClick={() => setuploadtype(2)}
                        onMouseEnter={(e) => {
                            if (uploadtype !== 2) {
                                e.currentTarget.style.backgroundColor = getuploadtypecolour('folder', false, true);
                            }
                        }}
                        onMouseMove={(e) => {
                            if (uploadtype !== 2) {
                                e.currentTarget.style.backgroundColor = getuploadtypecolour('folder', false, true);
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (uploadtype !== 2) {
                                e.currentTarget.style.backgroundColor = getuploadtypecolour('folder', false, false);
                            }
                        }}
                    >
                        Folder
                    </button>
                    <button
                        className="chip"
                        style={{
                            backgroundColor: uploadtype === 3 ? getuploadtypecolour('ftp', true, false) : getuploadtypecolour('ftp', false, false),
                            color: '#000000',
                        }}
                        onClick={() => setuploadtype(3)}
                        onMouseEnter={(e) => {
                            if (uploadtype !== 3) {
                                e.currentTarget.style.backgroundColor = getuploadtypecolour('ftp', false, true);
                            }
                        }}
                        onMouseMove={(e) => {
                            if (uploadtype !== 3) {
                                e.currentTarget.style.backgroundColor = getuploadtypecolour('ftp', false, true);
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (uploadtype !== 3) {
                                e.currentTarget.style.backgroundColor = getuploadtypecolour('ftp', false, false);
                            }
                        }}
                    >
                        FTP
                    </button>
                </div>
            )}
            {uploadtype === 1 && !uploadlocked && (
                <>
                    <div style={{ paddingTop: '0px' }}>
                        <p>Upload a single file</p>
                        <button
                            className="upload"
                            onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.setAttribute('accept', 'main, .pkm, .pkx, .sav, .pk1, .pk2, .pk3, .pk4, .pk5, .pk6, .pk7, .pk8, .pk9, .pkmn');
                                input.setAttribute('acceptlabel', 'Pokémon files');
                                input.onchange = (event) => {
                                    const files = (event.target as HTMLInputElement).files;
                                    if (files) {
                                        const efiles = Array.from(files).map(file => ({
                                            name: file.name,
                                            lastModified: file.lastModified,
                                            size: file.size,
                                            type: file.type,
                                            webkitRelativePath: file.webkitRelativePath,
                                            status: 0,
                                            file: file,
                                        }));
                                        setfiles(efiles as TypeFileExtended[]);
                                    }
                                };
                                input.click();
                            }}
                        >
                            Select Save/PKM File
                        </button>
                    </div>
                </>
            )}
            {uploadtype === 2 && !uploadlocked && (
                <div>
                    <p>Upload a folder</p>
                    <button
                        className="upload"
                        onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.setAttribute('directory', '');
                            input.setAttribute('webkitdirectory', '');
                            input.setAttribute('acceptlabel', 'Pokémon files');
                            input.onchange = (event) => {
                                const files = (event.target as HTMLInputElement).files;
                                if (files) {
                                    const filesarr = Array.from(files);
                                    const dupes = filesarr.filter((file, index, self) =>
                                        self.some((f, i) =>
                                            i !== index &&
                                            f.name.toLowerCase() === file.name.toLowerCase() &&
                                            (!f.webkitRelativePath || f.webkitRelativePath.toLowerCase() === file.webkitRelativePath.toLowerCase())
                                        )
                                    );
                                    if (dupes.length > 0) {
                                        alert("Duplicate files found:\n" + dupes.map(file => file.name).join('\n') + "\nPlease remove them or have something to separate them (maybe rename them?) and try again.");
                                        return;
                                    }
                                    const efiles = Array.from(files).map(file => ({
                                        name: file.name,
                                        lastModified: file.lastModified,
                                        size: file.size,
                                        type: file.type,
                                        webkitRelativePath: file.webkitRelativePath,
                                        status: 0,
                                        file: file,
                                    }));
                                    setfiles(efiles as TypeFileExtended[]);
                                }
                            };
                            input.click();
                        }}
                    >
                        Select Folder
                    </button>
                </div>
            )}
            {uploadtype === 3 && !uploadlocked && (
                <div>
                    <p>Upload via FTP</p>
                    <input type="text" placeholder="FTP Address" />
                    <input type="text" placeholder="Username" />
                    <input type="password" placeholder="Password" />
                </div>
            )}
            {uploadtype !== 3 && (
                <div
                    id="files"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'auto',
                        height: uploadlocked ? '350px' : '200px',
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        marginTop: '2px'
                    }}
                />
            )}
            <button
                className="upload"
                onClick={async () => {
                    uploaderrors.current = null;
                    setuploadlocked(true);
                    if (uploadtype !== 3) {
                        if ((uploadtype === 1 || uploadtype === 2) && files.length > 0) {
                            const doweupload = window.confirm(
                                "The times on your Pokémon might be incorrect if you use anything other than FTP. If you want to get an approximate time, I can guide you through it.\n\nSelect 'OK' to continue to uploading, or 'Cancel' to go back.",
                            );
                            if (!doweupload) {
                                setuploadlocked(false);
                                return;
                            } else if (doweupload) {
                                const output = window.prompt(
                                    "Alright!\nPress OK without any input if you want to skip this, otherwise, read ahead.\n1. Open a terminal or command prompt\n2. Navigate to the folder (if you want, you can use the one above it so we can see backup dates from Checkpoint if you used it too) where your Pokémon file(s) is located\n3. Use one of the following commands:\nLinux: `stat **/**`\nWindows: `powershell \"ls **/** | fl -prop name, creationTime\"`\nmacOS: `stat **/**`\nOnce you're done, copy and paste the command output here, then press OK to continue.",
                                );
                                // This part gets so messy that I need to use a comment beforehand to let you know that
                                // I might clean it up later, I might not.
                                // You are free to clean it up yourself if you want to, but fair warning, it will be difficult.
                                if (output === null) {
                                    setuploadlocked(false);
                                    return;
                                } else if (output) {
                                    let parsedfiles: (TypeFileExtended)[] = [];
                                    if (output.trim() === "") {
                                        parsedfiles = files.map((file) => {
                                            const fileextended = file as TypeFileExtended;
                                            fileextended.file = file;
                                            fileextended.timestamp = file.lastModified.toString();
                                            if (file.webkitRelativePath) {
                                                const pathparts = file.webkitRelativePath.split('/');
                                                fileextended.parentfolder = pathparts.length > 1 ? pathparts.slice(0, -1).join('/') : "";
                                            } else {
                                                fileextended.parentfolder = "";
                                            }
                                            return fileextended;
                                        });
                                    } else {
                                        const fileinfmap = new Map<string, { timestamp: string, parentfolder: string }>();
                                        if (output.includes("CreationTime") || output.includes("Name :")) {
                                            const fileentries = output.split(/(?=Name\s*:)/i);
                                            fileentries.forEach(entry => {
                                                if (!entry.trim()) return;
                                                const namereg = entry.match(/Name\s*:\s*(.*?)(?=\s*[A-Za-z]+\s*:|$)/i);
                                                const timereg = entry.match(/CreationTime\s*:\s*(.*?)(?=\s*[A-Za-z]+\s*:|$)/i);
                                                if (namereg && timereg) {
                                                    const path = namereg[1].trim();
                                                    const creationfromcmd = timereg[1].trim();
                                                    const pathparts = path.split(/[\/\\]/);
                                                    const filename = pathparts[pathparts.length - 1];
                                                    const parentfolder = pathparts.length > 1 ? pathparts.slice(0, -1).join('/') : "";
                                                    fileinfmap.set(filename.toLowerCase(), {
                                                        timestamp: new Date(creationfromcmd).getTime().toString(),
                                                        parentfolder
                                                    });
                                                    fileinfmap.set(path.toLowerCase(), {
                                                        timestamp: new Date(creationfromcmd).getTime().toString(),
                                                        parentfolder
                                                    });
                                                }
                                            });
                                        } else {
                                            const fileentries = output.split(/(?=File:)/i);
                                            fileentries.forEach(entry => {
                                                if (!entry.trim()) return;
                                                const filereg = entry.match(/File:\s*(.*?)(?=\s*\n|$)/i);
                                                if (!filereg) return;
                                                const path = filereg[1].trim();
                                                const pathparts = path.split(/[\/\\]/);
                                                const filename = pathparts[pathparts.length - 1];
                                                const parentfolder = pathparts.length > 1 ? pathparts.slice(0, -1).join('/') : "";
                                                const timereg = entry.match(/Birth:\s*(.*?)(?=\s*\n|$)/i);
                                                const modreg = entry.match(/Modify:\s*(.*?)(?=\s*\n|$)/i);
                                                if (timereg || modreg) {
                                                    const creationfromcmd = timereg ? timereg[1].trim() : modreg![1].trim();
                                                    const timestamp = new Date(creationfromcmd).getTime().toString();
                                                    fileinfmap.set(filename.toLowerCase(), { timestamp, parentfolder });
                                                    fileinfmap.set(path.toLowerCase(), { timestamp, parentfolder });
                                                }
                                            });
                                        }
                                        parsedfiles = files.map(file => {
                                            const fileextended = file as TypeFileExtended;
                                            fileextended.file = file;
                                            let fileinf = fileinfmap.get(file.name.toLowerCase());
                                            if (!fileinf) {
                                                for (const [key, value] of fileinfmap.entries()) {
                                                    if (key.endsWith('/' + file.name.toLowerCase()) ||
                                                        key.endsWith('\\' + file.name.toLowerCase())) {
                                                        fileinf = value;
                                                        break;
                                                    }
                                                }
                                            }
                                            if (fileinf) {
                                                fileextended.timestamp = fileinf.timestamp;
                                                fileextended.parentfolder = fileinf.parentfolder;
                                            } else {
                                                fileextended.timestamp = file.lastModified.toString();
                                                if (file.webkitRelativePath) {
                                                    const pathparts = file.webkitRelativePath.split('/');
                                                    fileextended.parentfolder = pathparts.length > 1 ? pathparts.slice(0, -1).join('/') : "";
                                                } else {
                                                    fileextended.parentfolder = "";
                                                }
                                            }
                                            return fileextended;
                                        });
                                    }
                                    console.log(parsedfiles);
                                    if (parsedfiles.length > 0) {
                                        const properfiles = files.map((file) => {
                                            const parsedfile = parsedfiles.find((pf) => pf.name === file.name);
                                            if (parsedfile) {
                                                const timereg2 = /^\d{14}$/;
                                                if (parsedfile.parentfolder && timereg2.test(parsedfile.parentfolder)) {
                                                    Object.defineProperty(file, "lastModified", {
                                                        value: new Date(parsedfile.parentfolder).getTime(),
                                                        writable: true,
                                                    });
                                                } else if (parsedfile.timestamp) {
                                                    Object.defineProperty(file, "lastModified", {
                                                        value: parseInt(parsedfile.timestamp),
                                                        writable: true,
                                                    });
                                                }
                                                if (!parsedfile.parentfolder || parsedfile.parentfolder === "") {
                                                    try {
                                                        const pathparts = file.webkitRelativePath.split('/');
                                                        parsedfile.parentfolder = pathparts.length > 1 ? pathparts.slice(0, -1).join('/') : "";
                                                    } catch (e) {
                                                        parsedfile.parentfolder = "";
                                                    }
                                                }
                                                Object.defineProperty(file, "parentfolder", {
                                                    value: parsedfile.parentfolder,
                                                    writable: true,
                                                });
                                            }
                                            return file;
                                        });
                                        setfiles(properfiles);
                                    } else {
                                        alert("Could not parse the provided output. Please ensure it is from the provided command.");
                                    }
                                }
                            }

                            const getdata = async () => {
                                for (const file of files) {
                                    const readablefile = file.file;
                                    if (!readablefile) {
                                        console.error(`[Client/Upload] No file object for ${file.name}`);
                                        file.status = 1;
                                        file.error = "Missing file data";
                                        continue;
                                    }
                                    const retfiledata = (file: File, callback: any) => {
                                        let reader = new FileReader();
                                        reader.readAsDataURL(file);
                                        reader.onload = function() {
                                            callback(reader.result);
                                        };
                                        reader.onerror = function(error) {
                                            console.log('Error converting file to base64:', error);
                                        };
                                    };
                                    try {
                                        retfiledata(readablefile as File, async (result: string) => {
                                                const base64: string = (result as string).split(',')[1];
                                                const hash: string = await gethash(base64);
                                                Object.assign(file, {
                                                    filedata: base64,
                                                    hash: hash,
                                                    status: 0
                                                });
                                            }
                                        );
                                    } catch (error) {
                                        console.error(`[Client/Upload] Error processing file ${file.name}:`, error);
                                        file.status = 1;
                                        file.error = (error instanceof Error) ? error.message : String(error);
                                    }
                                }
                                return;
                            };
                            await getdata();

                            console.log(files);

                            const chunksize = process.env.CHUNKSIZE ? process.env.CHUNKSIZE as unknown as number : 128 * 1024;
                            const sendinchunks = async (socket: { send: (data: any) => void; onMessage: (callback: (data: any) => void) => void; close: () => void; }, files: TypeFileExtended[]) => {
                                console.log('[Client/SOCKET] Starting to send files in chunks');

                                for (let index = 0; index < files.length; index++) {
                                    const file = files[index] as TypeFileExtended;
                                    if (!file.filedata) {
                                        console.error(`[Client/SOCKET] No file data for ${file.name} or the file is empty.`);
                                        file.status = 1;
                                        continue;
                                    }

                                    const filedata = file.filedata;
                                    const totalchunks = Math.ceil(filedata.length / chunksize);

                                    console.log(`[Client/SOCKET] File ${file.name}: ${filedata.length} bytes, will be sent in ${totalchunks} chunks`);

                                    for (let chunkindex = 0; chunkindex < totalchunks; chunkindex++) {
                                        const start = chunkindex * chunksize;
                                        const end = Math.min(start + chunksize, filedata.length);
                                        const chunk = filedata.substring(start, end);
                                        const lastchunk = chunkindex === totalchunks - 1;

                                        const progress = ((chunkindex + 1) / totalchunks) * 100;
                                        file.status = 2 + progress;
                                        setfiles([...files]);

                                        socket.send({
                                            type: 'chunk',
                                            filename: file.name,
                                            index,
                                            totalFiles: files.length,
                                            chunkindex,
                                            totalchunks,
                                            chunk,
                                            lastpart: lastchunk,
                                            metadata: {
                                                timestamp: file.lastModified,
                                                parentfolder: file.parentfolder || ""
                                            }
                                        });

                                        console.log(`Sent chunk ${chunkindex + 1}/${totalchunks} for ${file.name}, lastpart: ${lastchunk}`);

                                        await new Promise(resolve => setTimeout(resolve, 10));
                                    }
                                    file.status = 2;
                                    setfiles([...files]);
                                }
                            };
                            let complete = false;
                            opensocket<any, any>('/api/data/upload').then((socket) => {
                                console.log('[Client/SOCKET] WebSocket connected successfully');

                                socket.send({
                                    type: 'init',
                                    count: files.length,
                                    files: files.map(file => ({
                                        name: file.name,
                                        size: (file as TypeFileExtended).filedata?.length || 0,
                                        timestamp: file.lastModified,
                                        parentfolder: (file as TypeFileExtended).parentfolder || "",
                                        hash: (file as TypeFileExtended).hash || ""
                                    }))
                                });

                                socket.onMessage((data) => {
                                    if (data.status === 'gotinit') {
                                        console.log('[Client/SOCKET] Server acknowledged init message, proceeding with file upload');

                                        sendinchunks(socket, files).catch(err => {
                                            console.error('[Client/SOCKET] Error sending file chunks:', err);
                                            files.forEach(file => {
                                                file.status = 1;
                                            });
                                            setfiles(files);
                                            socket.close();
                                            uploaderrors.current = uploaderrors.current + `\n[Client/SOCKET] Error sending file chunks: ${err.message}`;
                                            setuploadlocked(false);
                                            setuploadfinished(false);
                                            BoxManager.enableclose();
                                        });

                                        socket.onMessage((data) => {
                                            console.log('[Client/SOCKET] Received socket message:', data);
                                            if (data.status === 'chunk') {
                                                console.log(`[Client/SOCKET] Chunk ${data.chunkindex + 1}/${data.totalchunks} received for ${data.filename}`);
                                            }

                                            if (data.status === 'filecomplete') {
                                                console.log(`[Client/SOCKET] File ${data.filename} upload complete`);
                                            }

                                            if (data.status === 'complete') {
                                                complete = true;
                                                console.log('[Client/SOCKET] All files uploaded successfully');
                                                setuploadfinished(true);
                                                console.log('[Client/SOCKET] Closing socket...');
                                                setTimeout(() => {
                                                    socket.close();
                                                    BoxManager.enableclose();
                                                }, 100);
                                            }

                                            if (data.status === 'uploadfailed' && data.error) {
                                                uploaderrors.current = uploaderrors.current + `\n${data.error}`;
                                            }

                                            if (data.error) {
                                                console.log('[Client/SOCKET] Server reported error: "', data.error + '"');
                                                if (data.filename) {
                                                    const file = files.find(f => f.name === data.filename);
                                                    if (file) {
                                                        file.status = 1;
                                                    }
                                                    setfiles(files);
                                                }
                                                uploaderrors.current = uploaderrors.current + `\n[Client/SOCKET] Upload error: "${data.error}"`;
                                            }
                                        });
                                    }
                                });

                                socket.onClose((event) => {
                                    if (!uploadfinished && !complete) {
                                        console.log('[Client/SOCKET] WebSocket closed unexpectedly:', event);
                                        setuploadlocked(false);
                                        setuploadfinished(false);
                                        BoxManager.enableclose();
                                    } else if (files.some(file => file.status === 1)) {
                                        console.log('[Client/SOCKET] Not all files successfully uploaded.');
                                        if (uploaderrors.current && uploaderrors.current.length > 0) {
                                            let cleaned = uploaderrors.current.trim().replace(/^null\s*/i, '').trim();
                                            uploaderrors.current = cleaned.length > 0 ? cleaned : null;
                                            console.log(uploaderrors.current);
                                            alert(uploaderrors.current);
                                        }
                                        setuploadlocked(false);
                                        setuploadfinished(false);
                                        BoxManager.enableclose();
                                    }
                                });

                                setuploadsock(socket as unknown as WebSocket);
                            }).catch((error) => {
                                console.error('[Client/SOCKET] Failed to open socket:', error);
                                alert('[Client/SOCKET] Error connecting to server: ' + error.message);
                                setuploadlocked(false);
                            });
                        } else {
                            alert("No files selected.");
                            setuploadlocked(false);
                            return;
                        }
                    } else {
                        setuploadlocked(false);
                    }
                }}
                style={{ display: uploadlocked ? 'none' : 'block' }}
            >
                Upload File(s)
            </button>
            <button
                style={{ display: uploadfinished ? 'block' : 'none', backgroundColor: 'rgb(0, 175, 0)', borderColor: 'rgb(0, 150, 0)' }}
                className="upload"
                onClick={() => {
                    BoxManager.enableclose();
                    BoxManager.close();
                }}
            >
                Upload Finished (Click to exit)
            </button>
        </div>
    );
}