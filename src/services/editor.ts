import { AnswerNotFound, NodeNotFound, WrongNodeType } from '../domain/exceptions.js';
import { isQuestionNode, isResultNode } from '../domain/guards.js';
import { genEdgeId, genNodeId } from '../helpers.js';
import type { ITreeEditor } from '../domain/interface.js';
import type {
  NodeId,
  AnswerId,
  DecitionTree,
  QuestionNode,
  TreeNode,
  BaseNode,
  ResultNode,
  AnswerEdge,
} from '../domain/types.js';

export default class TreeEditor implements ITreeEditor {
  private tree: DecitionTree = { rootId: 'NONE', nodes: {} };

  private createBase(type: 'question' | 'result', label?: string): BaseNode {
    return { id: genNodeId(), label: label ?? '...', type };
  }

  private createQuestion(questionText: string, label?: string): QuestionNode {
    const base = this.createBase('question', label);
    return { ...base, type: 'question', question: questionText, answers: [] };
  }

  private createResult(resultText: string, desc?: string, label?: string): ResultNode {
    const base = this.createBase('result', label);
    return { ...base, type: 'result', result: resultText, desc };
  }

  private createAnswer(text: string, toId: NodeId): AnswerEdge {
    return { id: genEdgeId(), text, to: toId };
  }

  private getNodeOrThrow(id: NodeId): TreeNode {
    const n = this.tree.nodes[id];
    if (!n) throw new NodeNotFound('Node not found');
    return n;
  }

  private ensureQuestion(n: TreeNode): QuestionNode {
    if (!isQuestionNode(n)) throw new WrongNodeType('Result node');
    return n;
  }

  private ensureResult(n: TreeNode): ResultNode {
    if (!isResultNode(n)) throw new WrongNodeType('Question node');
    return n;
  }

  private findParentEdge(
    nodeId: NodeId,
  ): { parentId: NodeId; edgeId: AnswerId; parent: QuestionNode } | undefined {
    for (const [pid, pnode] of Object.entries(this.tree.nodes)) {
      if (!isQuestionNode(pnode)) continue;
      const edge = pnode.answers.find((a) => a.to === nodeId);
      if (edge) return { parentId: pid as NodeId, edgeId: edge.id, parent: pnode };
    }
    return undefined;
  }

  private collectSubtree(rootId: NodeId): Set<NodeId> {
    const seen = new Set<NodeId>();
    const stack: NodeId[] = [rootId];
    while (stack.length) {
      const id = stack.pop() as NodeId;
      if (seen.has(id)) continue;
      seen.add(id);
      const n = this.getNodeOrThrow(id);
      if (isQuestionNode(n)) {
        for (const a of n.answers) stack.push(a.to);
      }
    }
    return seen;
  }

  createTree(firstQuestion: string, label?: string): DecitionTree {
    const root = this.createQuestion(firstQuestion, label);
    this.tree = { rootId: root.id, nodes: { [root.id]: root } };
    return this.tree;
  }

  createChildQuestion(parentId: NodeId, answer: string, question: string, label?: string) {
    const parent = this.ensureQuestion(this.getNodeOrThrow(parentId));
    const child = this.createQuestion(question, label);
    const edge = this.createAnswer(answer, child.id);
    parent.answers.push(edge);
    this.tree.nodes[child.id] = child;
    return { nodeId: child.id, edgeId: edge.id };
  }

  createChildResult(
    parentId: NodeId,
    answer: string,
    result: string,
    desc?: string,
    label?: string,
  ) {
    const parent = this.ensureQuestion(this.getNodeOrThrow(parentId));
    const child = this.createResult(result, desc, label);
    const edge = this.createAnswer(answer, child.id);
    parent.answers.push(edge);
    this.tree.nodes[child.id] = child;
    return { nodeId: child.id, edgeId: edge.id };
  }

  updateQuestion(nodeId: NodeId, newQuestion: string): void {
    const node = this.ensureQuestion(this.getNodeOrThrow(nodeId));
    node.question = newQuestion;
  }

  updateResult(nodeId: NodeId, newResult: string, newDesc?: string): void {
    const node = this.ensureResult(this.getNodeOrThrow(nodeId));
    node.result = newResult;
    node.desc = newDesc;
  }

  updateAnswerText(nodeId: NodeId, answerId: AnswerId, newText: string): void {
    const node = this.ensureQuestion(this.getNodeOrThrow(nodeId));
    const ans = node.answers.find((a) => a.id === answerId);
    if (!ans) throw new AnswerNotFound('Answer not found');
    ans.text = newText;
  }

  deleteNode(nodeId: NodeId): void {
    if (!this.tree.nodes[nodeId]) throw new NodeNotFound('Node not found');
    if (this.tree.rootId === nodeId) {
      throw new Error('Cannot delete root node');
    }

    const parent = this.findParentEdge(nodeId);
    if (parent) {
      parent.parent.answers = parent.parent.answers.filter((a) => a.to !== nodeId);
    } else {
      // bad, but nevermind
    }

    const toDrop = this.collectSubtree(nodeId);
    for (const id of toDrop) {
      delete this.tree.nodes[id];
    }
  }
}
