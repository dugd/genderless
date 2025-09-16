import { Router } from 'express';

import { csrfProtection } from '../middlewares.js';
import TreeEditor from '../services/editor.js';
import type { AnswerId, NodeId } from '../domain/types.js';
import { findParent, listChildren, requireNode } from '../helpers.js';
import { isQuestionNode } from '../domain/guards.js';
import { WrongNodeType } from '../domain/exceptions.js';
import { saveTree } from '../tree-store.js';

export function createEditorRouter(editor: TreeEditor): Router {
  const r = Router();

  r.get('/', csrfProtection, (req, res) => {
    const { rootId } = editor.getTree();
    if (!rootId || rootId === 'NONE') return res.status(404).send('Tree is empty');
    res.redirect(`/editor/nodes/${encodeURIComponent(rootId)}`);
  });

  r.get('/nodes/:id', csrfProtection, (req, res) => {
    try {
      const id = req.params.id as NodeId;
      const tree = editor.getTree();
      const node = requireNode(tree, id);
      const parentLink = findParent(tree, id);
      const children = listChildren(tree, id);
      const isRoot = tree.rootId === id;

      res.render('editor', {
        node,
        isRoot,
        parent: parentLink,
        children: children,
        csrfToken: req.csrfToken(),
      });
    } catch (e) {
      res.status(404).render('errors/404');
    }
  });

  r.get('/nodes/:id/new', csrfProtection, (req, res) => {
    try {
      const id = req.params.id as NodeId;
      const type = (req.query.type as string) === 'result' ? 'result' : 'question';
      const tree = editor.getTree();
      const parent = requireNode(tree, id);
      if (!isQuestionNode(parent)) throw new WrongNodeType('Question required');
      res.render('new-node', { parent, type, csrfToken: req.csrfToken() });
    } catch (e) {
      res.status(422).render('errors/422');
    }
  });

  r.post('/nodes/:id/children', csrfProtection, async (req, res) => {
    try {
      const parentId = req.params.id as NodeId;
      const { answerText, type, question, result, desc } = req.body as {
        answerText: string;
        type: 'question' | 'result';
        question?: string;
        result?: string;
        desc?: string;
      };
      let out: { nodeId: string; edgeId: string };
      if (type === 'result') {
        out = editor.createChildResult(parentId, answerText, String(result ?? '').trim(), desc);
      } else {
        out = editor.createChildQuestion(parentId, answerText, String(question ?? '').trim());
      }
      await saveTree(editor.getTree());
      return res.redirect(`/editor/nodes/${encodeURIComponent(out.nodeId)}`);
    } catch (e) {
      return res.status(400).render('errors/400');
    }
  });

  r.post('/nodes/:id/question', csrfProtection, async (req, res) => {
    try {
      const id = req.params.id as NodeId;
      const { question } = req.body as { question: string };
      editor.updateQuestion(id, String(question ?? '').trim());
      await saveTree(editor.getTree());
      res.redirect(`/editor/nodes/${encodeURIComponent(id)}`);
    } catch (e) {
      res.status(422).render('errors/422');
    }
  });

  r.post('/nodes/:id/result', csrfProtection, async (req, res) => {
    try {
      const id = req.params.id as NodeId;
      const { result, desc } = req.body as { result: string; desc?: string };
      editor.updateResult(id, String(result ?? '').trim(), desc);
      await saveTree(editor.getTree());
      res.redirect(`/editor/nodes/${encodeURIComponent(id)}`);
    } catch (e) {
      res.status(422).render('errors/422');
    }
  });

  r.post('/nodes/:id/answers/:answerId', csrfProtection, async (req, res) => {
    try {
      const id = req.params.id as NodeId;
      const answerId = req.params.answerId as AnswerId;
      const { text } = req.body as { text: string };
      editor.updateAnswerText(id, answerId, String(text ?? '').trim());
      await saveTree(editor.getTree());
      res.redirect(`/editor/nodes/${encodeURIComponent(id)}`);
    } catch (e) {
      res.status(422).render('errors/422');
    }
  });

  r.post('/nodes/:id/delete', csrfProtection, async (req, res) => {
    try {
      const id = req.params.id as NodeId;
      const tree = editor.getTree();
      const parent = findParent(tree, id);
      editor.deleteNode(id);
      if (parent) return res.redirect(`/editor/nodes/${encodeURIComponent(parent.id)}`);
      const { rootId } = tree;
      await saveTree(tree);
      return res.redirect(`/editor/nodes/${encodeURIComponent(rootId)}`);
    } catch (e) {
      return res.status(422).render('errors/422');
    }
  });

  return r;
}
