import { ConstraintStore } from "./ConstraintStore"
import { Do } from "./Do"
import { If } from "./If"
import { JSONizable } from "./JSONizable"
import { Mismatch } from "./Mismatch"
import { ConstraintObjectNotation } from "./ObjectNotation"
import { Operator } from "./Operator"

/**
 * ### Syntactical Sugar / Fluent Wizard
 */
export class Constraint extends ConstraintStore implements JSONizable<ConstraintObjectNotation> {
    private debugMessage?: Mismatch

    constructor(private name: string, private options?: { priority?: number }) {
        super()
    }

    /** Converts the constrait and all of its nodes to object notations */
    toJSON(): ConstraintObjectNotation {
        return {
            __type: "constraint",
            __ctor: this.constructor.name,
            name: this.name,
            // priority: this.options?.priority,
            conditions: this.head.toJSON(),
            executments: this.doList,
            debugMessage: this.debugMessage,
        }
    }

    if(conditional: If): this {
        this.insertIfAtEnd(conditional)
        return this
    }

    // BUG: operators are not yet correctly implemented, do not use them

    get or(): this {
        this.insertOperatorAtEnd(new Operator("or"))
        return this
    }
    get and(): this {
        this.insertOperatorAtEnd(new Operator("and"))
        return this
    }
    get xor(): this {
        this.insertOperatorAtEnd(new Operator("xor"))
        return this
    }

    do(execute: Do) {
        this.addDo(execute)
        return this
    }

    debug(callback: (failingCondition: unknown) => Mismatch): this
    debug(mismatch: Mismatch): this
    debug(param: Mismatch | ((failingCondition: unknown) => Mismatch)): this {
        if (typeof param === "function") {
            this.debugMessage = param("not implemented")
        } else {
            this.debugMessage = param
        }

        return this
    }
}
