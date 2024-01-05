import { IfObjectNotation } from "./ObjectNotation"
import { JSONizable } from "./JSONizable"
import { AppContext } from "./AppContext"
import { CallingConstraint } from "./Constraint"

/**
 * Interface for all If-Constructors
 *
 * ---
 *
 * Each class must satisfy theses requirements:
 *
 * - If the constructor has params AND uses them inside `validate`, then
 * `validate` must reproduce the same result if the same props were injected
 * into the constructor later and `validate` was called again.
 */
export interface If extends JSONizable<IfObjectNotation> {
    caller: CallingConstraint
    toJSON(): IfObjectNotation
    validate(props: AppContext.State): boolean | Promise<boolean>
}

export interface ImplementsIf {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): If
}
