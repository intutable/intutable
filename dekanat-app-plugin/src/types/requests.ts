import { SerializedColumn } from "./tables"

export type RowInsertData = Record<SerializedColumn["id"], unknown>
