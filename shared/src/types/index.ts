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

/**
 * Specifies properties for creating a lookup column.
 * @prop {SerializedColumn["id"]} linkColumn the ID of the link that the new column should be
 * added to
 * @prop {SerializedColumn["id"]} foreignColumn the ID of the column from the other table that
 * should be added
 */
export type LookupColumnSpecifier = {
    linkColumn: SerializedColumn["id"]
    foreignColumn: SerializedColumn["id"]
    attributes?: CustomColumnAttributes
}
