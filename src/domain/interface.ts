import type { DesitionTree, TreeContext, QuestionNode, Answer, ResultNode } from "./types.js"

export interface IInferenceService {
    selectAnswer(
        context: TreeContext,
        answer: Answer
    ): TreeContext

    confirmAnswer(
        context: TreeContext,
    ): TreeContext,

    isFinished(context: TreeContext): boolean

    getResult(context: TreeContext): ResultNode | undefined
}

export interface ISessionService {
    getCurrent(): TreeContext

    getHistory(): TreeContext[]

    push(context: TreeContext): void

    back(): TreeContext

    reset(tree: DesitionTree): TreeContext
}

export interface ITreeStorage {
    load(): Promise<DesitionTree>
    save(tree: DesitionTree): Promise<boolean>
}

export interface ITreeEditService {
    createTree(firstQuestion: string): QuestionNode

    createChildQuestion(parentId: number, answer: string, question: string): { node: QuestionNode, edge: Answer }

    createChildResult(parentId: number, answer: string, result: string, desc?: string): { node: ResultNode, edge: Answer }

    updateQuestion(nodeId: number, newQuestion: string): void

    updateResult(nodeId: number, newResult: string, newDesc?: string): void

    updateAnswerText(nodeId: number, answerId: number, newText: string): void

    deleteNode(nodeId: number): void
}
