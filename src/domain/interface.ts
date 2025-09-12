import type { DecitionTree, TreeContext, QuestionNode, AnswerEdge, ResultNode, AnswerId, TreeNode, NodeId, TraceEvent } from "./types.js"

export interface IInferenceService {
    getNode(id: NodeId): TreeNode

    set(): TreeContext

    selectAnswer(
        ctx: TreeContext,
        answerId: AnswerId
    ): TreeContext

    confirmAnswer(
        ctx: TreeContext,
    ): TreeContext

    apply(ctx: TreeContext, answerId: AnswerId): TreeContext

    peekNext(ctx: TreeContext, answerId: AnswerId): NodeId

    isFinished(ctx: TreeContext): boolean

    getResult(ctx: TreeContext): ResultNode | undefined
}

export interface IDecitionTrace {
    getCurrent(): TreeContext

    getHistory(): TreeContext[]

    push(ctx: TreeContext): void

    setCurrent(ctx: TreeContext): void

    back(): TreeContext

    reset(): TreeContext
}

export interface ITreeStorage {
    load(): Promise<DecitionTree | null>
    save(tree: DecitionTree): Promise<boolean>
}

export interface ITreeEditService {
    createTree(firstQuestion: string): NodeId

    createChildQuestion(parentId: number, answer: string, question: string): { nodeId: NodeId, edgeId: AnswerId }

    createChildResult(parentId: number, answer: string, result: string, desc?: string): { nodeId: NodeId, edgeId: AnswerId }

    updateQuestion(nodeId: number, newQuestion: string): void

    updateResult(nodeId: number, newResult: string, newDesc?: string): void

    updateAnswerText(nodeId: number, answerId: number, newText: string): void

    deleteNode(nodeId: number): void
}

export interface ITreeValidator {
    validate(tree: DecitionTree): boolean 
}

export interface ISessionFacade {
    getCurrent(): { ctx: TreeContext; node: TreeNode; finished: boolean };
    apply(answerId: AnswerId): { ctx: TreeContext; node: TreeNode; finished: boolean };
    back(): { ctx: TreeContext; node: TreeNode; finished: boolean };
    reset(): { ctx: TreeContext; node: TreeNode; finished: boolean };
    getResult(): ResultNode | undefined;
    getHistory(): TreeContext[];
}