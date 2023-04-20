import { AppContext } from "./AppContext"
import { CallingConstraint } from "./Constraint"
import { JSONizable } from "./JSONizable"
import { DoObjectNotation } from "./ObjectNotation"

/**
 * Interface for all Do-Constructors
 */
export interface Do extends JSONizable<DoObjectNotation> {
    caller: CallingConstraint
    toJSON(): DoObjectNotation
    execute(hooks: AppContext.Dispatch): void | Promise<void>
}

export interface ImplementsDo {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): Do
}
