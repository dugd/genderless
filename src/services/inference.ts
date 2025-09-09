import type { IInferenceService } from "../domain/interface.js";
import type { Answer, DesitionTree, ResultNode, TreeContext } from "../domain/types.js";
import { AnwerNotFound, WrongNodeType } from "../domain/exceptions.js"
import { isQuestionNode, isResultNode } from '../domain/guards.js'


export default class InferenceService implements IInferenceService {
    constructor (
        private tree: DesitionTree,
    ) {}

    start(): TreeContext {
        return {
            currentNode: this.tree.root,
        };
    }

    selectAnswer(context: TreeContext, answer: Answer): TreeContext {
        if (!isQuestionNode(context.currentNode)) {
            throw new WrongNodeType("It is ResultNode!");
        }

        if (!context.currentNode.answers.find((a) => a.answer == answer.answer)) {
            throw new AnwerNotFound("No find answer");
        }

        return {
            currentNode: context.currentNode,
            pendingAnswer: answer,
        }
    }

    confirmAnswer(context: TreeContext): TreeContext {
        if (!context.pendingAnswer) {
            throw new AnwerNotFound("No selected answer");
        }
        const currentNode = context.pendingAnswer.next;
        return {
            currentNode: context.pendingAnswer?.next,
        }
    }

    isFinished(context: TreeContext): boolean {
        return isResultNode(context.currentNode);
    }

    getResult(context: TreeContext): ResultNode | undefined {
        if (!isResultNode(context.currentNode)) {
            return undefined;
        }
        return context.currentNode;
    }
}
