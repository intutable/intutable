import { AppContext } from "../util/AppContext"
import { CallingConstraint } from "../util/Constraint"
import { Do } from "../util/Do"
import { DoObjectNotation } from "../util/ObjectNotation"

export class Snack implements Do {
    public caller: CallingConstraint

    constructor(public message: string) {}

    toJSON(): DoObjectNotation {
        return {
            __type: "do",
            __ctor: this.constructor.name,
            caller: this.caller,
            __props: [this.message],
        }
    }

    execute(props: AppContext.Dispatch) {
        const { snackInfo } = props
        snackInfo("Hallo Test")
    }
}
