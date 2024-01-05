import { CHANNEL } from "./internal"

/**
 * Hash a password using the same method this plugin uses.
 * Response: string
 */
export function hashPassword(password: string) {
    return { channel: CHANNEL, method: hashPassword.name, password }
}
/**
 * Get the current user from the session
 * Response: [User]{@link types.User}
 */
export function getCurrentUser() {
    return { channel: CHANNEL, method: getCurrentUser.name }
}

export function createUser(
    connectionId: string,
    username: string,
    password: string
) {
    return {
        channel: CHANNEL,
        method: createUser.name,
        connectionId,
        username,
        password,
    }
}
/** List all users. */
export function listUsers(connectionId: string) {
    return { channel: CHANNEL, method: listUsers.name, connectionId }
}

export function deleteUser(connectionId: string, id: number) {
    return { channel: CHANNEL, method: deleteUser.name, connectionId, id }
}

export function renameUser(connectionId: string, id: number, newName: string) {
    return {
        channel: CHANNEL,
        method: renameUser.name,
        connectionId,
        id,
        newName,
    }
}

export function changeUserPassword(
    connectionId: string,
    id: number,
    newPassword: string
) {
    return {
        channel: CHANNEL,
        method: changeUserPassword.name,
        connectionId,
        id,
        newPassword,
    }
}
