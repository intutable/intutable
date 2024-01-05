import { AppContext } from "../util/AppContext"
import { CallingConstraint } from "../util/Constraint"
import { If } from "../util/If"
import { IfObjectNotation } from "../util/ObjectNotation"

// @ts-ignore
function delay(delay) {
    return new Promise(resolve => setTimeout(resolve, delay))
}

export class Timeout implements If {
    // @ts-ignore
    public caller: CallingConstraint

    constructor(public readonly delay: number = 9000) {}

    toJSON(): IfObjectNotation {
        return {
            __type: "if",
            __ctor: this.constructor.name,
            __props: [this.delay],
            caller: this.caller,
        }
    }

    async validate(): Promise<boolean> {
        await delay(12000) // BUG: when using the argument `this.delay`, it won't work somehow

        return true
    }
}
