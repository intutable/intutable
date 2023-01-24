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
    | "inverseLinkColumnId"
    | "key"
    | "kind"
    | "index"
    | "isUserPrimaryKey"

export type CustomColumnAttributes = Partial<SerializedColumn>
