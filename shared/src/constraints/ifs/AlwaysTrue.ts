import { ConstraintContextProps } from "../util/ConstraintContextProps"
import { If } from "../util/If"
import { IfObjectNotation } from "../util/ObjectNotation"

export class AlwaysTrue implements If {
    toJSON(): IfObjectNotation {
        return {
            __type: "if",
            __ctor: this.constructor.name,
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validate(props: ConstraintContextProps) {
        return true
    }
}
