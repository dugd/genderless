import type { TreeNode, QuestionNode, ResultNode } from './types.js';

export function isQuestionNode(node: TreeNode): node is QuestionNode {
  return node.type === 'question';
}

export function isResultNode(node: TreeNode): node is ResultNode {
  return node.type === 'result';
}
