import type { Node, QuestionNode, ResultNode } from "./types.js";

export function isQuestionNode(node: Node): node is QuestionNode {
    return 'question' in node && 'answers' in node;
}

export function isResultNode(node: Node): node is ResultNode {
    return 'result' in node && 'desc' in node;
}
