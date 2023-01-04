export type JsonError = {
    method: string
    message: string
    code?: ErrorCode
    reason: unknown
}

export enum ErrorCode {
    alreadyTaken,
    writeInternalData,
    changeDefaultView,
    invalidRowWrite,
}

export function error<A>(method: string, message: string, code?: ErrorCode, reason?: unknown): Promise<A> {
    return Promise.reject(errorSync(method, message, code, reason))
}

export function errorSync(method: string, message: string, code?: ErrorCode, reason?: unknown): JsonError {
    let reason_: unknown
    if (reason instanceof Error) reason_ = reason.toString()
    else reason_ = reason
    return {
        method,
        message,
        code,
        reason: reason_,
    }
}
