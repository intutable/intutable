import { AppContext } from "../util/AppContext"
import { Do } from "../util/Do"
import { DoObjectNotation } from "../util/ObjectNotation"

export type Suggestion = {
    field: {
        record: unknown
        column: unknown
    }
    value: unknown
    message: string
}

/**
 * Suggest a value for a field.
 */
export class Suggest implements Do {
    constructor(public suggestion: Suggestion) {}

    toJSON(): DoObjectNotation {
        return {
            __type: "do",
            __ctor: this.constructor.name,
            __props: {
                suggestion: this.suggestion,
            },
        }
    }

    // TODO: implement a mechanism inside the frontend that
    execute(props: AppContext.Dispatch) {
        const { snackInfo } = props
        snackInfo("Vorschlag: ")
    }
}
