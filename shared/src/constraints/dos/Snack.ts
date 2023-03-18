import { AppContext } from "../util/AppContext"
import { Do } from "../util/Do"
import { DoObjectNotation } from "../util/ObjectNotation"

export class Snack implements Do {
    constructor(public message: string) {}

    toJSON(): DoObjectNotation {
        return {
            __type: "do",
            __ctor: this.constructor.name,
            message: this.message,
        }
    }

    execute(props: AppContext.Dispatch) {
        const { snackInfo } = props
        snackInfo("Hallo Test")
    }
}
