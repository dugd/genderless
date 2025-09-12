import crypto from 'node:crypto';
import type { IInferenceService, IDecitionTrace } from './domain/interface.js';
import SessionFacade from './session-facade.js';

export default class SessionStore {
  private readonly sessions = new Map<string, SessionFacade>();

  constructor(
    private readonly inf: IInferenceService,
    private readonly traceFactory: () => IDecitionTrace,
  ) {}

  create(): { id: string; facade: SessionFacade } {
    const id = crypto.randomBytes(16).toString('hex');
    const trace = this.traceFactory();
    const facade = new SessionFacade(this.inf, trace);
    this.sessions.set(id, facade);
    return { id, facade };
  }

  get(id: string): SessionFacade | undefined {
    return this.sessions.get(id);
  }

  delete(id: string): void {
    this.sessions.delete(id);
  }

  clear(): void {
    this.sessions.clear();
  }
}
