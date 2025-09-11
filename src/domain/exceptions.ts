export class DomainError extends Error {

}

export class NotFoundError extends DomainError {

}

export class WrongNodeType extends DomainError {

}

export class AnswerNotFound extends NotFoundError {

}

export class NodeNotFound extends NotFoundError {

}

export class TransitionMissing extends DomainError {

}