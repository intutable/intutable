export type JsonError = {
    method: string
    message: string
    code?: ErrorCode
    reason: unknown
}

export enum ErrorCode {
    alreadyTaken,
    writeInternalData,
}

export function error<A>(
    method: string,
    message: string,
    code?: ErrorCode,
    reason?: unknown
): Promise<A> {
    let reason_: unknown
    if (reason instanceof Error) reason_ = reason.toString()
    else reason_ = reason
    return Promise.reject({
        method,
        message,
        code,
        reason: reason_,
    })
}
