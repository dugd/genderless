import { Router } from 'express';

import { csrfProtection, attachSessionId } from '../middlewares.js';
import { isQuestionNode } from '../domain/guards.js';
import type SessionStore from '../session-store.js';

export function createSiteRouter(store: SessionStore): Router {
  const r = Router();

  r.get('/', csrfProtection, (req, res) => {
    res.render('index', { csrfToken: req.csrfToken() });
  });

  r.post('/start', csrfProtection, (req, res) => {
    const { id } = store.create();
    res.cookie('sid', id, { httpOnly: true, sameSite: 'lax' });
    res.redirect('/test');
  });

  r.get('/test', csrfProtection, attachSessionId, (req, res) => {
    if (!req.sessionId) return res.redirect('/');

    try {
      const facade = store.get(req.sessionId);
      if (!facade) {
        throw new Error('Cannot find session');
      }
      const { ctx, node, finished } = facade.getCurrent();

      if (node.type === 'result') {
        return res.redirect('/result');
      }
      res.render('question', { node, csrfToken: req.csrfToken() });
    } catch (e: any) {
      res.status(400).render('error', { message: e.message });
    }
  });

  r.post('/answer', csrfProtection, attachSessionId, (req, res) => {
    if (!req.sessionId) return res.redirect('/');

    const { answerId } = req.body as { answerId?: string };
    if (!answerId) return res.status(400).render('error', { message: 'Не обрано відповідь' });

    try {
      const facade = store.get(req.sessionId);
      if (!facade) {
        throw new Error('Cannot find session');
      }
      const { ctx, node, finished } = facade.apply(answerId);
      res.redirect(finished ? '/result' : '/test');
    } catch (e: any) {
      res.status(400).render('error', { message: e.message });
    }
  });

  r.get('/result', csrfProtection, attachSessionId, (req, res) => {
    if (!req.sessionId) return res.redirect('/');

    try {
      const facade = store.get(req.sessionId);
      if (!facade) {
        throw new Error('Cannot find session');
      }
      const { ctx, node, finished } = facade.getCurrent();
      if (isQuestionNode(node) || !finished) return res.redirect('/test');
      res.render('result', {
        result: node,
        history: facade.getHistory(),
        csrfToken: req.csrfToken(),
      });
    } catch (e: any) {
      res.status(400).render('error', { message: e.message });
    }
  });

  r.post('/restart', csrfProtection, (req, res) => {
    res.clearCookie('sid');
    res.redirect('/');
  });

  r.use((req, res) => {
    res.status(404).render('error', { message: 'Сторінку не знайдено' });
  });

  return r;
}
