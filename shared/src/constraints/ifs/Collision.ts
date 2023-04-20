import { AppContext } from "../util/AppContext"
import { CallingConstraint } from "../util/Constraint"
import { If } from "../util/If"
import { IfObjectNotation } from "../util/ObjectNotation"

// TODO: once operators are supported, this can be further abstracted

// TODO: compare-methods for cell types

export type Comparable = {
    comparableTypes?: unknown[] // <- cell type names, optional
}

export type FieldCollision = {
    // self:
}

export class Collision implements If {
    public caller: CallingConstraint

    constructor() {}

    toJSON(): IfObjectNotation {
        return {
            __type: "if",
            __ctor: this.constructor.name,
            caller: this.caller,
        }
    }

    validate() {
        return true
    }
}
