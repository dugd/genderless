export type Node = {
    id: number;
    label: string;
}

export type Answer = {
    answer: string;
    next: TreeNode;
}

export interface QuestionNode extends Node {
    question: string;
    answers: Answer[];
}

export interface ResultNode extends Node {
    result: string;
    desc?: string;
}

export type TreeNode = QuestionNode | ResultNode;

export interface DesitionTree {
    root: QuestionNode;
}

export interface TreeContext {
    isFinished: boolean;
    currentNode: TreeNode;
    pendingAnswer?: Answer;
}
