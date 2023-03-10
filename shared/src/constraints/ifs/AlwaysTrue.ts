import { AppContext } from "../util/AppContext"
import { If } from "../util/If"
import { IfObjectNotation } from "../util/ObjectNotation"

export class AlwaysTrue implements If {
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
