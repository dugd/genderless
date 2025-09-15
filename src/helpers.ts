import { NodeNotFound } from './domain/exceptions.js';
import { isQuestionNode } from './domain/guards.js';
import type { AnswerId, DecitionTree, NodeId, QuestionNode, TreeNode } from './domain/types.js';
import { v4 as uuidv4 } from 'uuid';

export function genId(): string {
  return uuidv4();
}
export function genNodeId(): NodeId {
  return ('n_' + genId()) as NodeId;
}
export function genEdgeId(): AnswerId {
  return ('a_' + genId()) as AnswerId;
}

export function getNode(tree: DecitionTree, id: NodeId): TreeNode | undefined {
  return tree.nodes[id];
}

export function requireNode(tree: DecitionTree, id: NodeId): TreeNode {
  const n = getNode(tree, id);
  if (!n) throw new NodeNotFound('Node not found');
  return n;
}

export function findParent(tree: DecitionTree, nodeId: NodeId): QuestionNode | undefined {
  if (tree.rootId === nodeId) return undefined;
  const { nodes } = tree;
  for (const [pid, pnode] of Object.entries(nodes)) {
    if (!isQuestionNode(pnode)) continue;
    const edge = pnode.answers.find((a) => a.to === nodeId);
    if (edge) return pnode as QuestionNode;
  }
  return undefined;
}

export function listChildren(tree: DecitionTree, nodeId: NodeId): TreeNode[] {
  const n = getNode(tree, nodeId);
  if (!n || !isQuestionNode(n)) return [];
  return n.answers.map((a) => requireNode(tree, a.to));
}
