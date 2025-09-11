import { ValidateError } from "../domain/exceptions.js";
import { isQuestionNode } from "../domain/guards.js";
import type { ITreeValidator } from "../domain/interface.js";
import type { DecitionTree } from "../domain/types.js";

export default class TreeValidator implements ITreeValidator {
    validate(tree: DecitionTree): boolean {
        const rootId = tree.rootId;
        if (!tree.nodes[rootId]) {
            throw new ValidateError("rootId not in nodes");
        }

        for (const [k, n] of Object.entries(tree.nodes)) {
            if (isQuestionNode(n)) {
                if (n.answers.length == 0) {
                    throw new ValidateError("QuestionNode without answers");
                }
                for (const a of n.answers) {
                    if (!tree.nodes[a.to]) {
                        throw new ValidateError(`Edge to uknown node: ${n.id} -> ${a.to}`);
                    }
                }
            }
        }

        return true;
    }
    
}