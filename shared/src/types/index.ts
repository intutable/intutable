import { LinkDescriptor, SerializedColumn, TableId } from "./tables"
export * from "./tables"
export * from "./filter"

/**
 * Subset of a column's props (note: these are metadata: "id" and
 * "index" (column index) are totally distinct from the ID and index
 * (row index) _columns_ that exist in object tables)
 * They cannot be changed by the back-ends "change column attributes" method.
 */
export const immutableColumnAttributes = [
    "id",
    "parentColumnId",
    "linkId",
    "inverseLinkColumnId",
    "key",
    "kind",
    "index",
    "isUserPrimaryKey",
] as const

export type ImmutableColumnAttributes = (typeof immutableColumnAttributes)[number]

export type CustomColumnAttributes = Partial<SerializedColumn>
