import type { IInferenceService } from "../domain/interface.js";
import type { AnswerEdge, AnswerId, DecitionTree, NodeId, ResultNode, TreeContext, TreeNode } from "../domain/types.js";
import { AnswerNotFound, NodeNotFound, WrongNodeType } from "../domain/exceptions.js"
import { isQuestionNode, isResultNode } from '../domain/guards.js'


export default class InferenceService implements IInferenceService {
    constructor(private tree: DecitionTree) {}

    getNode(id: NodeId): TreeNode {
        const n = this.tree.nodes[id];
        if (!n) throw new NodeNotFound(`Unknown node ${id}`);
        return n;
    }

    set(): TreeContext { 
        return { currentId: this.tree.rootId };
    }

    selectAnswer(ctx: TreeContext, answerId: AnswerId): TreeContext {
        const node = this.getNode(ctx.currentId);
        if (!isQuestionNode(node)) throw new WrongNodeType("Cannot select answer on result");   
        const found = node.answers.find(a => a.id === answerId);
        if (!found) throw new AnswerNotFound();
        return { ...ctx, pendingAnswerId: answerId };
        }

    confirmAnswer(ctx: TreeContext): TreeContext {
        if (!ctx.pendingAnswerId) throw new AnswerNotFound("No pending answer");
        const node = this.getNode(ctx.currentId);
        if (!isQuestionNode(node)) throw new WrongNodeType("Cannot confirm on result");
        const ans = node.answers.find(a => a.id === ctx.pendingAnswerId);
        if (!ans) throw new AnswerNotFound(`No answer with id: ${ctx.pendingAnswerId}`);
        return { currentId: ans.to };
    }

    apply(ctx: TreeContext, answerId: AnswerId): TreeContext {
        return this.confirmAnswer(this.selectAnswer(ctx, answerId));
    }

    peekNext(ctx: TreeContext, answerId: AnswerId): NodeId {
        const tmp = this.selectAnswer(ctx, answerId);
        const confirmed = this.confirmAnswer(tmp);
        return confirmed.currentId;
    }

    isFinished(ctx: TreeContext): boolean {
        return isResultNode(this.getNode(ctx.currentId));
    }

    getResult(ctx: TreeContext): ResultNode | undefined {
        const n = this.getNode(ctx.currentId);
        return isResultNode(n) ? n : undefined;
    }
}
