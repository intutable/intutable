import { Operator, OperatorType } from "./Operator"
import { Node } from "./ConstraintStore"
import { Mismatch } from "./Mismatch"

export type NodeType = "constraint" | "if" | "do" | "operator"

export type NodeObjectNotation<T> = {
    __type: "node"
    __ctor: string
    next: NodeObjectNotation<T> | null
    data: T
}

export type ConstraintObjectNotation = {
    __type: "constraint"
    __ctor: string
    name: string
    priority?: number
    conditions: NodeObjectNotation<IfObjectNotation | OperatorObjectNotation>
    executments: DoObjectNotation[]
    debugMessage?: Mismatch
}

export type OperatorObjectNotation = {
    __type: "operator"
    __ctor: string
    operator: OperatorType
}

export type IfObjectNotation = {
    __type: "if"
    __ctor: string
    __props?: unknown[]
    [key: string]: unknown
}

export type DoObjectNotation = {
    __type: "do"
    __ctor: string
    __props?: unknown[]
    [key: string]: unknown
}
