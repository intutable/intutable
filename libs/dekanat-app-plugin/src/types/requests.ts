import { SerializedColumn } from "./tables"
import { RawRow } from "./raw"

export type RowData = Record<SerializedColumn["id"], unknown>
export type RawRowData = RawRow

import type { TableId, CustomColumnAttributes } from "shared/dist/types"
export { CustomColumnAttributes }

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
}

/**
 * Specifies properties for creating a lookup column.
 * @prop {number} linkId the ID of the link that the new column should be
 * added to (NOT the link column, but the link object! It is accessible through the property
 * `linkId` of a `SerializedColumn`)
 * @prop {SerializedColumn["id"]} foreignColumn the ID of the column from the other table that
 * should be added
 */
export type LookupColumnSpecifier = {
    linkId: number
    foreignColumn: SerializedColumn["id"]
}
