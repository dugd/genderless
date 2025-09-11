import type { ITreeStorage } from "../domain/interface.js";
import type { DecitionTree } from "../domain/types.js";

import fs from 'fs/promises';


export default class LocalJSONTreeStorage implements ITreeStorage {
    constructor(
        private filePath: string,
    ) {}

    async load(): Promise<DecitionTree | null> {
        try {
            const raw = await fs.readFile(this.filePath, { encoding: 'utf-8', });
            return JSON.parse(raw) as DecitionTree;
        } catch (e) {
            console.error("Error: load from file");
            return null;
        }
    }
    async save(tree: DecitionTree): Promise<boolean> {
        try {
            const tmp = this.filePath + ".tmp"; // no rewrite
            await fs.writeFile(tmp, JSON.stringify(tree), { encoding: 'utf-8', });
            await fs.rename(tmp, this.filePath);
            return true;
        } catch (e) {
            console.error("Error: saving to file");
            return false;
        }
    }
}
