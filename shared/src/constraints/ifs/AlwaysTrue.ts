import { AppContext } from "../util/AppContext"
import { CallingConstraint } from "../util/Constraint"
import { If } from "../util/If"
import { IfObjectNotation } from "../util/ObjectNotation"

export class AlwaysTrue implements If {
    public caller: CallingConstraint

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
