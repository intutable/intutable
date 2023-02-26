import { AppContext } from "../util/AppContext"
import { If } from "../util/If"
import { IfObjectNotation } from "../util/ObjectNotation"

export class Throw implements If {
    toJSON(): IfObjectNotation {
        return {
            __type: "if",
            __ctor: this.constructor.name,
        }
    }

    validate(): boolean {
        throw new Error("This class is supposed to throw")
    }
}
