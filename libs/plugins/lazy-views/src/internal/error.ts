export async function error(method: string, message: string, cause?: any) {
    let error
    if (cause instanceof Error) error = cause.toString()
    else error = cause
    return Promise.reject({
        method,
        message,
        cause: error,
    })
}
