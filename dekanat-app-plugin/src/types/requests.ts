import { SerializedColumn } from "./tables"

export type RowData = Record<SerializedColumn["id"], unknown>
export type RawRowData = Record<string, unknown>
