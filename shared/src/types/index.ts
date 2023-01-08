import { SerializedColumn, TableId } from "./tables"
export * from "./tables"
export * from "./filter"

export type CustomColumnAttributes = Partial<SerializedColumn>

/**
 * On creating a standard column, these are the properties that must be
 * specified.
 */
export type StandardColumnSpecifier = {
    name: string
    cellType: string
    attributes?: CustomColumnAttributes
}

/**
 * On creating a link column, this object describes its properties - mandatorily, which table
 * is to be linked to, and any other custom props like "hidden" can be optionally supplied.
 */
export type LinkColumnSpecifier = {
    foreignTable: TableId
    attributes?: CustomColumnAttributes
}
