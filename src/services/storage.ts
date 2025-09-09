import type { ITreeStorage } from "../domain/interface.js";
import type { DesitionTree } from "../domain/types.js";

import fs from 'fs/promises';


export default class LocalJSONTreeStorage implements ITreeStorage {
    constructor(
        private filePath: string,
    ) {}

    async load(): Promise<DesitionTree | null> {
        try {
            await fs.access(this.filePath, fs.constants.F_OK);
            const raw = await fs.readFile(this.filePath, { encoding: 'utf-8', });
            return JSON.parse(raw) as DesitionTree;
        } catch (e) {
            console.error("Error: load from file");
            return null;
        }
    }
    async save(tree: DesitionTree): Promise<boolean> {
        try {
            await fs.writeFile(this.filePath, JSON.stringify(tree), { encoding: 'utf-8', });
            return true;
        } catch (e) {
            console.error("Error: saving to file");
            return false;
        }
    }
}