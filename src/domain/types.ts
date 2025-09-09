export type Answer = {
    text: string;
    next?: QuestionNode;
    result?: ResultNode;
}

export interface ITreeNode {
    id: number;
    title: string;
}

export type QuestionNode = {
    id: number;
    question: string;
    answers: Answer[];
}

export type ResultNode = {
    id: number;
    text: string;
    desc?: string;   
}

export interface DesitionTree {
    root: QuestionNode;
}

export interface TreeContext {
    isFinished: boolean;
    currentNode: QuestionNode;
    pendingAnswer?: Answer;
    result?: ResultNode;
}
