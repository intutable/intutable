import type { Column } from "react-data-grid"
import type Obj from "@utils/Obj"

/**
 * Defines the type of a table.
 */
export type TableData<TRow = Obj> = {
    tableName: string
    columns: Column<TRow>[]
    rows: TRow[]
}
