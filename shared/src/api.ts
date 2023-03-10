/**
 * Helper functions and constants for the `dekanat-app-plugin`'s API.
 */
import { Column, ColumnType } from "@intutable/database/dist/types"

export { immutableColumnAttributes } from "./types"

/**
 * The two basic columns that every table must have (in addition to _id, but
 * the project-management plugin creates that automatically)
 */
export const APP_TABLE_COLUMNS: Column[] = [
    { name: "index", type: ColumnType.integer, options: [] },
    { name: "name", type: ColumnType.text, options: [] },
]

/**
 * Much functionality of tables goes directly through views, so we maintain a default view
 * with no filters on every table. This is its name.
 */
export function defaultViewName() {
    return "Standard"
}
/**
 * Each table is automatically created with a "name" column right off the bat. It cannot be deleted
 * and _should_ (but does not strictly have to) have a unique value, this is what the term
 * "user primary" or "user primary key" refers to. This function determines that column's name.
 */
export function userPrimaryColumnName() {
    return "Name"
}

export const ROW_INDEX_KEY = "index"
export const COLUMN_INDEX_KEY = "index"
