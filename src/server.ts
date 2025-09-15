import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import type { DecitionTree } from './domain/types.js';
import InferenceService from './services/inference.js';
import LocalJSONTreeStorage from './services/storage.js';
import DecitionTrace from './services/trace.js';
import TreeValidator from './services/validator.js';
import SessionStore from './session-store.js';
import { createSiteRouter } from './routes/site.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FILE_PATH = path.resolve(__dirname, '../assets/tree.json');

async function loadTree(filePath: string): Promise<DecitionTree> {
  const storage = new LocalJSONTreeStorage(filePath);
  const tree = await storage.load();
  if (!tree) {
    throw new Error('Cannot access tree');
  }
  new TreeValidator().validate(tree);
  return tree;
}

async function main() {
  const app = express();
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use('/static', express.static(path.join(__dirname, 'public')));
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(helmet({ contentSecurityPolicy: false }));

  const tree = await loadTree(FILE_PATH);
  const inference = new InferenceService(tree);
  const store = new SessionStore(inference, () => new DecitionTrace(inference.set()));

  app.use('/', createSiteRouter(store));

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
