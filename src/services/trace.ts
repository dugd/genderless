import type { IDecitionTrace } from "../domain/interface.js";
import type { TreeContext } from "../domain/types.js";

export default class DecitionTrace implements IDecitionTrace {
    private history: TreeContext[] = [];

    constructor(start: TreeContext) {
        this.history = [start];
    }

    _checkLength(): boolean {
        if (this.history.length == 0) {
            throw new Error("History is empty");
        }
        return true;
    }

    getCurrent(): TreeContext {
        this._checkLength();
        return this.history[this.history.length - 1]!;
    }

    getHistory(): TreeContext[] {
        return this.history;
    }

    setCurrent(ctx: TreeContext): void {
        this._checkLength();
        this.history[this.history.length - 1] = ctx;
    }

    push(ctx: TreeContext): void {
        this.history.push(ctx);
    }

    back(): TreeContext {
        if (this.history.length > 1) {
            this.history.pop();
        }
        return this.getCurrent();
    }

    reset(): TreeContext {
        this._checkLength();
        this.history = [this.history[0]!];
        return this.getCurrent();
    }
    
}