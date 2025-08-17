import path from 'path';
import fs from 'fs/promises';
import { handlesave, storepokemon, extractpokemonfromsave } from '@/app/api/handle';

async function getfiles(dir: string): Promise<string[]> {
    let files: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files = files.concat(await getfiles(fullPath));
        } else {
            files.push(fullPath);
        }
    }
    return files;
}

async function reindexer() {
    const bdir = path.resolve(__dirname, '../data/backups');
    const files = await getfiles(bdir);
    for (const file of files) {
        try {
            const data = await fs.readFile(file);
            const base64data = data.toString('base64');
            const extractedtime = new Date();
            const rsp = path.relative(path.join(__dirname, '../data/backups'), file).split(path.sep).slice(1).join(path.sep);
            try {
                const saveres = await handlesave(base64data, rsp, extractedtime);
                console.log(`Reindexed as save: ${rsp}`);
                const saveinfo = saveres?.saveinfo;
                const saveid = saveres?.save?.id || null;
                const savetimestamp = saveinfo?.Timestamp ? new Date(Number(saveinfo.Timestamp)) : extractedtime;
                if (saveinfo) {
                    await extractpokemonfromsave(saveinfo, saveid, savetimestamp, extractedtime, rsp);
                    console.log(`Extracted and indexed Pokémon from save: ${rsp}`);
                }
                continue;
            } catch (saveErr: any) {
                if (saveErr?.message !== 'NOT_SAVE_FILE') {
                    console.error(`Error saving ${rsp}:`, saveErr);
                    continue;
                }
            }
            try {
                await storepokemon(base64data, null, extractedtime, extractedtime, rsp);
                console.log(`Reindexed as pokemon: ${rsp}`);
            } catch (pkmErr) {
                console.log(`Skipped (not save or pokemon): ${rsp}`);
            }
        } catch (err) {
            console.error(`Error processing ${file}:`, err);
        }
    }
    console.log('Reindexing complete.');
}

reindexer();