import { SerializedColumn } from "./tables"
export * from "./tables"
export * from "./filter"

export type CustomColumnAttributes = Partial<SerializedColumn>
/**
 * On creating a standard column, these are the properties that must be
 * specified.
 */
export type StandardColumnSpecifier = {
    name: string
    _cellContentType: string
    editable: boolean
    attributes?: CustomColumnAttributes
}
