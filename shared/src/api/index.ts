import { Column, ColumnType } from "@intutable/database/dist/types"
import { ColumnInfo } from "@intutable/lazy-views/dist/types"

/**
 * The two basic columns that every table must have (in addition to _id, but
 * the project-management plugin creates that automatically)
 * These are columns in the underlying table, while {@link isAppColumn}
 * refers to columns of the view on top of it.
 */
export const APP_TABLE_COLUMNS: Column[] = [
    { name: "index", type: ColumnType.integer, options: [] },
    { name: "name", type: ColumnType.string, options: [] },
]
