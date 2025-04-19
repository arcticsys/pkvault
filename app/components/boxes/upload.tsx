'use client';

import React from 'react';
import { BoxManager } from '../box';
import { TypeFileExtended, opensocket } from '@/app/lib';
import { createRoot } from 'react-dom/client';
import { getgencolour, getuploadtypecolour } from '../colours';

/*function singlefilechipmenu(generation: number, setgeneration: React.Dispatch<React.SetStateAction<number>>) {
    return (
        <>
            <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', padding: '8px', whiteSpace: 'nowrap' }}>
                <button
                    className="chip"
                    style={{
                        backgroundColor: generation === 1 ? 'rgb(132, 171, 68)' : 'rgb(172, 211, 108)',
                        color: '#000000',
                    }}
                    onClick={() => setgeneration(1)}
                    onMouseEnter={(e) => {
                        if (generation !== 1) {
                            e.currentTarget.style.backgroundColor = 'rgb(152, 191, 88)';
                        }
                    }}
                    onMouseMove={(e) => {
                        if (generation !== 1) {
                            e.currentTarget.style.backgroundColor = 'rgb(152, 191, 88)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (generation !== 1) {
                            e.currentTarget.style.backgroundColor = 'rgb(172, 211, 108)';
                        }
                    }}
                >
                    Gen1 (R/B/Y)
                </button>
                <button
                    className="chip"
                    style={{
                        backgroundColor: generation === 2 ? 'rgb(180, 174, 79)' : 'rgb(220, 214, 119)',
                        color: '#000000',
                    }}
                    onClick={() => setgeneration(2)}
                    onMouseEnter={(e) => {
                        if (generation !== 2) {
                            e.currentTarget.style.backgroundColor = 'rgb(200, 194, 99)';
                        }
                    }}
                    onMouseMove={(e) => {
                        if (generation !== 2) {
                            e.currentTarget.style.backgroundColor = 'rgb(200, 194, 99)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (generation !== 2) {
                            e.currentTarget.style.backgroundColor = 'rgb(220, 214, 119)';
                        }
                    }}
                >
                    Gen2 (G/S/C)
                </button>
                <button
                    className="chip"
                    style={{
                        backgroundColor: generation === 3 ? 'rgb(116, 175, 160)' : 'rgb(156, 215, 200)',
                        color: '#000000',
                    }}
                    onClick={() => setgeneration(3)}
                    onMouseEnter={(e) => {
                        if (generation !== 3) {
                            e.currentTarget.style.backgroundColor = 'rgb(136, 195, 180)';
                        }
                    }}
                    onMouseMove={(e) => {
                        if (generation !== 3) {
                            e.currentTarget.style.backgroundColor = 'rgb(136, 195, 180)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (generation !== 3) {
                            e.currentTarget.style.backgroundColor = 'rgb(156, 215, 200)';
                        }
                    }}
                >
                    Gen3 (R/S/E/FR/LG)
                </button>
                <button
                    className="chip"
                    style={{
                        backgroundColor: generation === 4 ? 'rgb(143, 123, 155)' : 'rgb(183, 163, 195)',
                        color: '#000000',
                    }}
                    onClick={() => setgeneration(4)}
                    onMouseEnter={(e) => {
                        if (generation !== 4) {
                            e.currentTarget.style.backgroundColor = 'rgb(163, 143, 175)';
                        }
                    }}
                    onMouseMove={(e) => {
                        if (generation !== 4) {
                            e.currentTarget.style.backgroundColor = 'rgb(163, 143, 175)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (generation !== 4) {
                            e.currentTarget.style.backgroundColor = 'rgb(183, 163, 195)';
                        }
                    }}
                >
                    Gen4 (D/P/Pl/HG/SS)
                </button>
                <button
                    className="chip"
                    style={{
                        backgroundColor: generation === 5 ? 'rgb(119, 162, 183)' : 'rgb(159, 202, 223)',
                        color: '#000000',
                    }}
                    onClick={() => setgeneration(5)}
                    onMouseEnter={(e) => {
                        if (generation !== 5) {
                            e.currentTarget.style.backgroundColor = 'rgb(139, 182, 203)';
                        }
                    }}
                    onMouseMove={(e) => {
                        if (generation !== 5) {
                            e.currentTarget.style.backgroundColor = 'rgb(139, 182, 203)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (generation !== 5) {
                            e.currentTarget.style.backgroundColor = 'rgb(159, 202, 223)';
                        }
                    }}
                >
                    Gen5 (B/W/B2/W2)
                </button>
                <button
                    className="chip"
                    style={{
                        backgroundColor: generation === 6 ? 'rgb(181, 56, 100)' : 'rgb(221, 96, 140)',
                        color: '#000000',
                    }}
                    onClick={() => setgeneration(6)}
                    onMouseEnter={(e) => {
                        if (generation !== 6) {
                            e.currentTarget.style.backgroundColor = 'rgb(201, 76, 120)';
                        }
                    }}
                    onMouseMove={(e) => {
                        if (generation !== 6) {
                            e.currentTarget.style.backgroundColor = 'rgb(201, 76, 120)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (generation !== 6) {
                            e.currentTarget.style.backgroundColor = 'rgb(221, 96, 140)';
                        }
                    }}
                >
                    Gen6 (X/Y/OR/AS)
                </button>
                <button
                    className="chip"
                    style={{
                        backgroundColor: generation === 7 ? 'rgb(192, 108, 91)' : 'rgb(232, 148, 131)',
                        color: '#000000',
                    }}
                    onClick={() => setgeneration(7)}
                    onMouseEnter={(e) => {
                        if (generation !== 7) {
                            e.currentTarget.style.backgroundColor = 'rgb(212, 128, 111)';
                        }
                    }}
                    onMouseMove={(e) => {
                        if (generation !== 7) {
                            e.currentTarget.style.backgroundColor = 'rgb(212, 128, 111)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (generation !== 7) {
                            e.currentTarget.style.backgroundColor = 'rgb(232, 148, 131)';
                        }
                    }}
                >
                    Gen7 (S/M/US/UM)
                </button>
                <button
                    className="chip"
                    style={{
                        backgroundColor: generation === 8 ? 'rgb(161, 85, 152)' : 'rgb(201, 125, 192)',
                        color: '#000000',
                    }}
                    onClick={() => setgeneration(8)}
                    onMouseEnter={(e) => {
                        if (generation !== 8) {
                            e.currentTarget.style.backgroundColor = 'rgb(181, 105, 172)';
                        }
                    }}
                    onMouseMove={(e) => {
                        if (generation !== 8) {
                            e.currentTarget.style.backgroundColor = 'rgb(181, 105, 172)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (generation !== 8) {
                            e.currentTarget.style.backgroundColor = 'rgb(201, 125, 192)';
                        }
                    }}
                >
                    Gen8 (Sw/Sh/BD/SP)
                </button>
                <button
                    className="chip"
                    style={{
                        backgroundColor: generation === 9 ? 'rgb(195, 152, 89)' : 'rgb(235, 192, 129)',
                        color: '#000000',
                    }}
                    onClick={() => setgeneration(9)}
                    onMouseEnter={(e) => {
                        if (generation !== 9) {
                            e.currentTarget.style.backgroundColor = 'rgb(215, 172, 109)';
                        }
                    }}
                    onMouseMove={(e) => {
                        if (generation !== 9) {
                            e.currentTarget.style.backgroundColor = 'rgb(215, 172, 109)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (generation !== 9) {
                            e.currentTarget.style.backgroundColor = 'rgb(235, 192, 129)';
                        }
                    }}
                >
                    Gen9 (S/V)
                </button>
            </div>
            <div>Selected generation: {generation}</div>
        </>
    );
}*/

function filescomp(files: TypeFileExtended[], setfiles: React.Dispatch<React.SetStateAction<File[]>>) {
    return (
        <div>
            {files.slice().sort((a, b) => a.name.localeCompare(b.name)).map((file, index) => (
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
                            setfiles((prevFiles: File[]) => prevFiles.filter((_, i: number) => i !== index));
                        }}
                    >
                        ✖
                    </button>
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '5px',
                            left: '5px',
                            right: '5px',
                            height: '5px',
                            backgroundColor: '#444',
                            borderRadius: '2.5px',
                            overflow: 'hidden',
                        }}
                        id="progressbar"
                    >
                        <div
                            style={{
                                width: '0%',
                                height: '100%',
                                backgroundColor: '#4caf50',
                                borderRadius: '2.5px',
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function Upload() {
    const [uploadtype, setuploadtype] = React.useState(0);
    const [files, setfiles] = React.useState<TypeFileExtended[]>([]);
    const [uploadlocked, setuploadlocked] = React.useState(false);
    const [uploadfinished, setuploadfinished] = React.useState(false);
    let filesroot = React.useRef<ReturnType<typeof createRoot> | null>(null);
    
    React.useEffect(() => {
        const element = document.getElementById('files');
        if (element) {
            const probablyfilesroot = element.querySelector('div');
            if (!filesroot.current || !probablyfilesroot) {
                filesroot.current = createRoot(element);
            }
            if (filesroot.current) {
                filesroot.current.render(filescomp(files, setfiles));
            }
        }
    }, [files, uploadtype]);

    React.useEffect(() => {
        if (uploadlocked) {
            BoxManager.disableclose();
        } else {
            BoxManager.enableclose();
        }
    }, [uploadlocked]);

    return (
        <div>
            <h1>Upload Save(s)</h1>
            <div style={{ display: uploadlocked ? 'none' : 'block' }}>It's highly recommended to use FTP as you'll get accurate times displayed in your vault</div>
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
                                        setfiles(Array.from(files));
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
                                    setfiles(filesarr as TypeFileExtended[]);
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
                onClick={() => {
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
                                    if (output === "") {
                                        parsedfiles = files.map((file) => {
                                            const fileextended = file as TypeFileExtended;
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
                                                const reader = new FileReader();
                                                reader.onload = () => {
                                                    const buf = reader.result as ArrayBuffer;
                                                    const u8arr = new Uint8Array(buf);
                                                    let binstr = '';
                                                    for (let i = 0; i < u8arr.length; i += 1024) {
                                                        binstr += String.fromCharCode.apply(
                                                            null,
                                                            u8arr.subarray(i, i + 1024) as unknown as number[]
                                                        );
                                                    }
                                                    const b64 = btoa(binstr);
                                                    Object.defineProperty(file, "filedata", {
                                                        value: b64,
                                                        writable: true,
                                                    });
                                                };
                                                reader.readAsArrayBuffer(file);
                                            }
                                            return file;
                                        });
                                        setfiles(properfiles);
                                        console.log("Parsed files:", properfiles);
                                    } else {
                                        alert("Could not parse the provided output. Please ensure it is from the provided command.");
                                    }
                                }
                            }
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
                style={{ display: uploadlocked ? 'block' : 'none', backgroundColor: 'rgb(0, 175, 0)', borderColor: 'rgb(0, 150, 0)' }}
                className="upload"
            >
                Upload Finished (Click to exit)
            </button>
        </div>
    );
}