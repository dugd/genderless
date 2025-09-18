import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import InferenceService from './services/inference.js';
import DecitionTrace from './services/trace.js';
import TreeEditor from './services/editor.js';
import SessionStore from './session-store.js';
import { createSiteRouter } from './routes/site.js';
import { createEditorRouter } from './routes/editor.js';
import { loadTree } from './tree-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const app = express();
  const port = process.env.PORT ? Number(process.env.PORT) : 8000;

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use('/static', express.static(path.join(__dirname, 'public')));
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(helmet({ contentSecurityPolicy: false }));

  const tree = await loadTree();

  const editor = new TreeEditor(tree);

  const inference = new InferenceService(tree);
  const store = new SessionStore(inference, () => new DecitionTrace(inference.set()));

  app.use('/editor', createEditorRouter(editor));
  app.use('/', createSiteRouter(store));

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
