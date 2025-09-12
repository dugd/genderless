import type { AnswerId, NodeId } from './domain/types.js';
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
