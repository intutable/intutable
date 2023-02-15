import { User } from "types/User"
import { openConnection, closeConnection } from "@intutable/database/dist/requests"
import { coreRequest } from "./coreRequest"

/**
 * Acquire a connection with read/write privileges to the database, run
 * a callback with it, and return its result.
 * Reject with an { error: message } if the credentials are not found or
 * if the login fails.
 */
export const withReadWriteConnection = async <T>(
    user: User,
    callback: (connId: string) => Promise<T>
): Promise<T> => {
    const username = process.env.DB_RW_USERNAME
    const password = process.env.DB_RW_PASSWORD
    if (!username || !password)
        return Promise.reject({
            error: "username or password not found in env",
        })

    const connId = await coreRequest<{ connectionId: string }>(
        openConnection(username, password),
        user.authCookie
    ).then(({ connectionId }) => connectionId)
    let result: T
    try {
        result = await callback(connId)
    } finally {
        await coreRequest<void>(closeConnection(connId), user.authCookie)
    }
    return result
}

/**
 * Acquire a connection with read-only privileges to the database, run
 * a callback with it, and return its result.
 * Reject with an { error: message } if the credentials are not found or
 * if the login fails.
 */
export const withReadOnlyConnection = async <T>(
    user: User,
    callback: (connId: string) => Promise<T>
): Promise<T> => {
    const username = process.env.DB_RDONLY_USERNAME
    const password = process.env.DB_RDONLY_PASSWORD
    if (!username || !password) throw Error("username or password not found in env")

    const connId = await coreRequest<{ connectionId: string }>(
        openConnection(username, password),
        user.authCookie
    ).then(({ connectionId }) => connectionId)
    let result: T
    try {
        result = await callback(connId)
    } finally {
        await coreRequest<void>(closeConnection(connId), user.authCookie)
    }
    return result
}
