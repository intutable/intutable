import { ConstraintStore } from "./ConstraintStore"
import { Do } from "./Do"
import { If } from "./If"
import { JSONizable } from "./JSONizable"
import { ConstraintObjectNotation, DoObjectNotation, IfObjectNotation } from "./ObjectNotation"
import { Operator } from "./Operator"
import { v4 as uuidv4 } from "uuid"

/**
 * ### Syntactical Sugar / Fluent Wizard
 */
export class Constraint extends ConstraintStore implements JSONizable<ConstraintObjectNotation> {
    private uuid: string

    constructor(private name: string) {
        super()
        this.uuid = uuidv4()
    }

    /** Converts the constrait and all of its nodes to object notations */
    toJSON(): ConstraintObjectNotation {
        return {
            __type: "constraint",
            id: this.uuid,
            name: this.name,
            // @ts-ignore
            conditions: this.head.toJSON(),
            executments: this.doList,
        }
    }

    if(conditional: If): this {
        conditional.caller = {
            id: this.uuid,
            name: this.name,
        }
        this.insertIfAtEnd(conditional)
        return this
    }

    do(execute: Do) {
        execute.caller = {
            id: this.uuid,
            name: this.name,
        }
        this.addDo(execute)
        return this
    }

    // TODO: implement callable operators
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
}

export type CallingConstraint = {
    id: string
    name: string
}
