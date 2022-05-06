export type ObjectWithError<T = unknown> = {
    error: T
}

export const isObjectWithError = (value: unknown): value is ObjectWithError => {
    if (typeof value !== "object" || value == null) return false

    const obj = value
    if ("error" in obj) return true

    return false
}

export const getLastErrorFromChain = (error: ObjectWithError): unknown => {
    let returnValue: unknown = error.error
    while (isObjectWithError(returnValue)) {
        returnValue = returnValue.error
    }
    return returnValue
}
