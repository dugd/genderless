import type { IInferenceService, IDecitionTrace, ISessionFacade } from '../domain/interface.js';
import type { AnswerId, TraceEvent, TreeContext } from '../domain/types.js';

export default class SessionFacade implements ISessionFacade {
  private events: TraceEvent[] = [];

  constructor(
    private readonly inf: IInferenceService,
    private readonly trace: IDecitionTrace,
  ) {}
  getCurrent() {
    const ctx = this.trace.getCurrent();
    const node = this.inf.getNode(ctx.currentId);
    return { ctx, node, finished: this.inf.isFinished(ctx) };
  }

  apply(answerId: AnswerId) {
    const before = this.trace.getCurrent();
    const last = this.inf.selectAnswer(before, answerId);
    this.trace.setCurrent(last);
    const nextId = this.inf.peekNext(before, answerId);
    const after = this.inf.confirmAnswer(last);
    this.trace.push(after);
    this.events.push({
      at: Date.now(),
      from: before.currentId,
      answerId,
      to: nextId,
    });
    const node = this.inf.getNode(after.currentId);
    return { ctx: after, node, finished: this.inf.isFinished(after) };
  }

  back() {
    const from = this.trace.getCurrent();
    const toCtx = this.trace.back();
    this.events.push({
      at: Date.now(),
      from: from.currentId,
      to: toCtx.currentId,
    });
    const node = this.inf.getNode(toCtx.currentId);
    return { ctx: toCtx, node, finished: this.inf.isFinished(toCtx) };
  }

  reset() {
    const ctx = this.trace.reset();
    this.events.push({
      at: Date.now(),
      from: 'RESET' as any,
      to: ctx.currentId,
    });
    const node = this.inf.getNode(ctx.currentId);
    return { ctx, node, finished: this.inf.isFinished(ctx) };
  }

  getResult() {
    return this.inf.getResult(this.trace.getCurrent());
  }

  getHistory(): TreeContext[] {
    return this.trace.getHistory();
  }
}
