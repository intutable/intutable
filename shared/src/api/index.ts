import { Column, ColumnType } from "@intutable/database/dist/types"
import { ColumnInfo } from "@intutable/lazy-views/dist/types"

/**
 * "internal" columns means ones that are in every table, but that the user
 * does not see.
 */
export const isInternalColumn = (column: ColumnInfo): boolean =>
    column.attributes.isInternal === 1

/**
 * "app" columns means ones that are created by the app for each table,
 * separate from the ones that users manually create, but that are not
 * hidden like the ones defined by {@link isInternalColumn}. For now, that
 * is an index column and a checkbox column.
 * The type is a nasty kludge. It should be
 * `SerializedColumn | DeserializedColumn`, but the GUI's deserialized column
 * type is defined via a module augmentation, which you can't import across
 * workspaces, so we'd have to duplicate it here. Better to just enumerate
 * the props needed.
 */
export const isAppColumn = (column: { key: string; kind: string }): boolean =>
    column.key === "select-row" || column.kind === "index"
// `select-row` is defined by rdg – do NOT change this

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
