import type { Column } from "react-data-grid"
import type Obj from "@utils/Obj"

export type Row = {
    id: number
    [key: string]: unknown
}

/**
 * Defines the type of a table.
 */
export type TableData<TRow extends Obj = Row> = {
    tableName: string
    columns: Column<TRow>[]
    rows: TRow[]
}
