import LocalJSONTreeStorage from './services/storage.js';
import TreeValidator from './services/validator.js';
import type { DecitionTree } from './domain/types.js';
import { FILE_PATH } from './config.js';

export async function loadTree(): Promise<DecitionTree> {
  const storage = new LocalJSONTreeStorage(FILE_PATH);
  const tree = await storage.load();
  if (!tree) {
    throw new Error('Cannot access tree');
  }
  new TreeValidator().validate(tree);
  return tree;
}

export async function saveTree(tree: DecitionTree): Promise<void> {
  const storage = new LocalJSONTreeStorage(FILE_PATH);
  const result = await storage.save(tree);
}
