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
    addNode(parent: QuestionNode, question: string): QuestionNode

    removeNode(nodeId: number, tree: DesitionTree): DesitionTree

    updateNode(nodeId: number, newQuestion: string): DesitionTree

    addAnswer(nodeId: number, answer: Answer, tree: DesitionTree): DesitionTree

    removeAnswer(nodeId: number, answerIndex: number, tree: DesitionTree): DesitionTree

    updateAnswer(nodeId: number, answerIndex: number, newText: string): DesitionTree

    setResult(nodeId: number, answerIndex: number, result: ResultNode, tree: DesitionTree): DesitionTree
}
