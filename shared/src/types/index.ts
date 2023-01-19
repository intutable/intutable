import { LinkDescriptor, SerializedColumn, TableId } from "./tables"
export * from "./tables"
export * from "./filter"

/**
 * Subset of the column attributes ({@link types.tables.MetaColumnProps}) that are substantial
 * to a column and that must not be changed. If you change these, make sure to update
 * {@link api.immutableColumnAttributes} as well.
 */
export type ImmutableColumnAttributes =
    | "id"
    | "parentColumnId"
    | "linkId"
    | "key"
    | "kind"
    | "index"
    | "isUserPrimaryKey"

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
    linkId: LinkDescriptor["id"]
    foreignColumn: SerializedColumn["id"]
    attributes?: CustomColumnAttributes
}
