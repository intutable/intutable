export type User = {
    id: number
    email: string
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

/**
 * Since the details are kept secretively in the database, we'll only give
 * a description to the user.
 */
export type CustomRole = {
    id: number
    name: string
    description: string
}
