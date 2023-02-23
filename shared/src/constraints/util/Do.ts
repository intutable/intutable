import { JSONizable } from "./JSONizable"
import { DoObjectNotation } from "./ObjectNotation"

/**
 * Interface for all Do-Constructors
 */
export interface Do extends JSONizable<DoObjectNotation> {
    toJSON(): DoObjectNotation
    // execute()
}

export interface ImplementsDo {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): Do
}
