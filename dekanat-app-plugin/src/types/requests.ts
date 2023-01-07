import { SerializedColumn } from "./tables"
import { RawRow } from "./raw"

export type RowData = Record<SerializedColumn["id"], unknown>
export type RawRowData = RawRow
