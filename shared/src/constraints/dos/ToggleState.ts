import { AppContext } from "../util/AppContext"
import { CallingConstraint } from "../util/Constraint"
import { Do } from "../util/Do"
import { DoObjectNotation } from "../util/ObjectNotation"

export class ToggleState implements Do {
    public caller: CallingConstraint

    constructor() {}

    toJSON(): DoObjectNotation {
        return {
            __type: "do",
            __ctor: this.constructor.name,
            caller: this.caller,
        }
    }

    execute(hooks: AppContext.Dispatch) {
        hooks.setTest(true)
    }
}
