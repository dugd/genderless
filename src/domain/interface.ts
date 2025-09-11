import type { DesitionTree, TreeContext, QuestionNode, AnswerEdge, ResultNode, AnswerId, TreeNode, NodeId } from "./types.js"

export interface IInferenceService {
    getNode(id: NodeId): TreeNode

    start(): TreeContext

    selectAnswer(
        ctx: TreeContext,
        answerId: AnswerId
    ): TreeContext

    confirmAnswer(
        ctx: TreeContext,
    ): TreeContext,

    isFinished(ctx: TreeContext): boolean

    getResult(ctx: TreeContext): ResultNode | undefined
}

export interface ISessionService {
    getCurrent(): TreeContext

    getHistory(): TreeContext[]

    push(ctx: TreeContext): void

    back(): TreeContext

    reset(tree: DesitionTree): TreeContext
}

export interface ITreeStorage {
    load(): Promise<DesitionTree | null>
    save(tree: DesitionTree): Promise<boolean>
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
    validate(tree: DesitionTree): boolean 
}
