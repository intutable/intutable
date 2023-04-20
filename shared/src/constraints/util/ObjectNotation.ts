import { CallingConstraint } from "./Constraint"
import { OperatorType } from "./Operator"

export type NodeType = "constraint" | "if" | "do" | "operator"

export type NodeObjectNotation<T> = {
    __type: "node"
    __ctor: string
    next: NodeObjectNotation<T> | null
    data: T
}

export type ConstraintObjectNotation = {
    __type: "constraint"
    id: string
    name: string
    conditions: NodeObjectNotation<IfObjectNotation | OperatorObjectNotation>
    executments: DoObjectNotation[]
}

export type OperatorObjectNotation = {
    __type: "operator"
    __ctor: string
    operator: OperatorType
}

export type IfObjectNotation<P = unknown[]> = {
    __type: "if"
    __ctor: string
    __props?: P
    caller: CallingConstraint
}

export type DoObjectNotation<P = unknown[]> = {
    __type: "do"
    __ctor: string
    __props?: P
    caller: CallingConstraint
}
