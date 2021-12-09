import { User } from "@context/AuthContext"
import { CellType } from "."

/**
 * Blacklist of types that cannot be converted to each other.
 * E.g. a number can not be converted to a string.
 */
const BLOCKED_CONVERSION: Array<[CellType, CellType]> = []

/**
 * Tells if type A can be converted to type B.
 * @param {CellType} from A
 * @param {CellType} to B
 * @returns either true or an error with a message that can be displayed to the user.
 */
export const isConvertable = (from: CellType, to: CellType): true | Error =>
    new Error("not implemented")

export const convert = (
    from: CellType,
    to: CellType,
    user: User,
    project: string,
    table: string,
    col: string
) => {} // call method from /api/
