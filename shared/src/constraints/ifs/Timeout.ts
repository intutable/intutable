import { ConstraintContextProps } from "../util/ConstraintContextProps"
import { If } from "../util/If"
import { IfObjectNotation } from "../util/ObjectNotation"

function delay(delay) {
    return new Promise(resolve => setTimeout(resolve, delay))
}

export class Timeout implements If {
    // in ms
    constructor(public readonly delay: number = 9000) {}

    toJSON(): IfObjectNotation {
        return {
            __type: "if",
            __ctor: this.constructor.name,
            __props: [this.delay],
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async validate(props: ConstraintContextProps): Promise<boolean> {
        await delay(12000) // BUG: when using the argument `this.delay`, it won't work somehow

        return true
    }
}
