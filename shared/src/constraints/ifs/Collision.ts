import { AppContext } from "../util/AppContext"
import { If } from "../util/If"
import { IfObjectNotation } from "../util/ObjectNotation"




// TODO: once operators are supported, this can be further abstracted

// TODO: compare-methods for cell types

export type Comparable = {
    comparableTypes?: unknown[] // <- cell type names, optional
}



export type FieldCollision = {
    self: 
}

export class Collision implements If {

    constructor()

    toJSON(): IfObjectNotation {
        return {
            __type: "if",
            __ctor: this.constructor.name,
        }
    }

    validate() {
        return true

    }
}
