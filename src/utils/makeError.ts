import { inspect } from "util"

type ObjectWithError<T = unknown> = {
    error: T
}

const isObjectWithError = (value: unknown): value is ObjectWithError => {
    if (typeof value !== "object" || value == null) return false

    const obj = value
    if ("error" in obj) return true

    return false
}

const getLastErrorFromChain = (error: ObjectWithError): unknown => {
    let returnValue: unknown = error.error
    while (isObjectWithError(returnValue)) {
        returnValue = returnValue.error
    }
    return returnValue
}

// const replacer = (key: string, value: unknown) => {
//     if (value instanceof Error) {
//         const error = {}

//         Object.getOwnPropertyNames(value).forEach(function (propName) {
//             error[propName] = value[propName]
//         })

//         return error
//     }

//     return value
// }

// const stringifyError = (err: Error): string => JSON.stringify(err, replacer)

// const parseError = (value: string): Error | false => {
//     return false
// }

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
