import { AppContext } from "../util/AppContext"
import { Do } from "../util/Do"
import { DoObjectNotation } from "../util/ObjectNotation"

export class ToggleState implements Do {
    constructor() {}

    toJSON(): DoObjectNotation {
        return {
            __type: "do",
            __ctor: this.constructor.name,
        }
    }

    execute(hooks: AppContext.Dispatch) {
        hooks.setTest(true)
    }
}
