export async function error(method: string, message: string, reason?: any) {
    let error
    if (reason instanceof Error) error = reason.toString()
    else error = reason
    return Promise.reject({
        method,
        message,
        reason: error,
    })
}
