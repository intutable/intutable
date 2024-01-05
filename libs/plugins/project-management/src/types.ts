import { Column, ColumnType } from "@intutable-org/database/dist/types"

export interface ProjectDescriptor {
    id: number
    name: string
}

export interface TableDescriptor {
    id: number
    name: string
    key: string
}

// should eventually be the input type to `createColumnInTable`.
export interface ColumnWithMetadata extends Column {
    attributes: Record<string, any>
}

/**
 * Describes a column of an object (as opposed to meta) table.
 */
export interface ColumnDescriptor {
    id: number
    name: string
    type: ColumnType
    attributes: Record<string, any>
}

export interface TableInfo {
    table: TableDescriptor
    columns: ColumnDescriptor[]
}

/**
 * {@link TableInfo} plus the result set of selecting from the table.
 * Since the row type returned by knex (and hence by
 * {@link requestsgetTableData}) just contains unknowns, we exposed this
 * parameter so a user can - if they know what type the result set has -
 * easily cast their `TableData` to a custom type without having to manually
 * rewrite `TableInfo`.
 */
export interface TableData<Row> extends TableInfo {
    rows: Row[]
}
/** The row type returned by knex. */
export type Row = Record<string, unknown>
