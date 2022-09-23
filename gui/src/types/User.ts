export type User = {
    username: string
    authCookie: string
    id: number
    isLoggedIn: boolean
    role: Role
}

/**
 * temp, should eventually be provided by permission plugin
 */
export type Role = DefaultRole | CustomRole

export enum DefaultRole {
    /** Basically for a user who is not even logged in. */
    Guest,
    /** Full privileges. */
    Admin,
}

export type CustomRole = never
