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

export type CustomRole = {
    view: TablePermissions[]
    edit: TablePermissions[]
    alter: TablePermissions[]
}

export type TablePermissions = {
    table: string
    columns: string[]
    rows: number[]
}
