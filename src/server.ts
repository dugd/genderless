import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import csrf from "csurf";

import type { DecitionTree } from "./domain/types.js";
import InferenceService from "./services/inference.js";
import LocalJSONTreeStorage from "./services/storage.js";
import DecitionTrace from "./services/trace.js";
import TreeValidator from "./services/validator.js";
import SessionStore from "./session-store.js";
import { isQuestionNode, isResultNode } from "./domain/guards.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FILE_PATH = path.resolve(__dirname, "../assets/tree.json");

async function loadTree(filePath: string): Promise<DecitionTree> {
  const storage = new LocalJSONTreeStorage(filePath)
  const tree = await storage.load()
  if (!tree) {
    throw new Error("Cannot access tree");
  }
  (new TreeValidator()).validate(tree)
  return tree;
}

async function main() {
  const app = express();
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.use("/static", express.static(path.join(__dirname, "public")));
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(helmet({ contentSecurityPolicy: false }));

  const csrfProtection = csrf({ cookie: true });

  const tree = await loadTree(FILE_PATH);
  const inference = new InferenceService(tree);
  const store = new SessionStore(inference, () => new DecitionTrace(inference.set()));

  function getSessionId(req: express.Request): string | undefined {
    return req.cookies["sid"];
  }

  app.get("/", csrfProtection, (req, res) => {
    res.render("index", { csrfToken: req.csrfToken() });
  });

  app.post("/start", csrfProtection, (req, res) => {
    const { id } = store.create();
    res.cookie("sid", id, { httpOnly: true, sameSite: "lax" });
    res.redirect("/test");
  });

  app.get("/test", csrfProtection, (req, res) => {
    const sid = getSessionId(req);
    if (!sid) return res.redirect("/");

    try {
      const facade = store.get(sid);
      if (!facade) {
        throw new Error("Cannot find session");
      }
      const { ctx, node, finished } = facade.getCurrent()

      if (node.type === "result") {
        return res.redirect("/result");
      }
      res.render("question", { node, csrfToken: req.csrfToken() });
    } catch (e: any) {
      res.status(400).render("error", { message: e.message });
    }
  });

  app.post("/answer", csrfProtection, (req, res) => {
    const sid = getSessionId(req);
    if (!sid) return res.redirect("/");

    const { answerId } = req.body as { answerId?: string };
    if (!answerId) return res.status(400).render("error", { message: "Не обрано відповідь" });

    try {
      const facade = store.get(sid);
      if (!facade) {
        throw new Error("Cannot find session");
      }
      const { ctx, node, finished } = facade.apply(answerId);
      res.redirect(inference.isFinished(ctx) ? "/result" : "/test");
    } catch (e: any) {
      res.status(400).render("error", { message: e.message });
    }
  });

  app.get("/result", csrfProtection, (req, res) => {
    const sid = getSessionId(req);
    if (!sid) return res.redirect("/");

    try {
      const facade = store.get(sid);
      if (!facade) {
        throw new Error("Cannot find session");
      }
      const { ctx, node, finished } = facade.getCurrent();
      if (isQuestionNode(node) || !finished) return res.redirect("/test");
      res.render("result", { result: node, history: facade.getHistory(), csrfToken: req.csrfToken() });
    } catch (e: any) {
      res.status(400).render("error", { message: e.message });
    }
  });

  app.post("/restart", csrfProtection, (req, res) => {
    res.clearCookie("sid");
    res.redirect("/");
  });

  app.use((req, res) => {
    res.status(404).render("error", { message: "Сторінку не знайдено" });
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
