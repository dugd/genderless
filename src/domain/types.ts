export type NodeId = string; // easy to change
export type AnswerId = string;

export type AnswerEdge = {
  id: AnswerId;
  text: string;
  to: NodeId; // id > ref
};

export interface BaseNode { 
  id: NodeId; 
  label: string; 
  type: "question" | "result"; 
}

export interface QuestionNode extends BaseNode {
  type: "question";
  question: string;
  answers: AnswerEdge[];
}

export interface ResultNode extends BaseNode {
  type: "result";
  result: string;
  desc?: string | undefined;
}

export type TreeNode = QuestionNode | ResultNode;

export interface DecitionTree {
  rootId: NodeId;
  nodes: Record<NodeId, TreeNode>;
}

export interface TreeContext {
  currentId: NodeId;
  pendingAnswerId?: AnswerId;
}

export interface TraceEvent {
  at: number;
  from: NodeId;
  answerId?: AnswerId;
  to: NodeId;
}