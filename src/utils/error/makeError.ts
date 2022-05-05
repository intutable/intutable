import { inspect } from "util"
import {
    ObjectWithError,
    isObjectWithError,
    getLastErrorFromChain,
} from "./getLastErrorFromChain"

export const makeError = (err: unknown): Error => {
    let value = err

    if (isObjectWithError(value) === true)
        value = getLastErrorFromChain(value as ObjectWithError)

    if (value instanceof Error) return value

    if (typeof value === "string") {
        // if (value === true) {
        //     // TODO: try to parse if it is deserialized
        // }

        return new Error(value)
    }

    return new Error(
        `Unparsable Error: tried to handle the following error but could not parse it: ${inspect(
            value
        )}`
    )
}
