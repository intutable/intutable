export type ServerRow = {
    id: string // TODO: does the backend applies ids to each row?
    [key: string]: string
}

/**
 * Defines the type of a table.
 */
export type ServerTableData<TRow extends Obj = ServerRow> = {
    tableName: string
    columns: ServerColumn<TRow>[]
    rows: TRow[]
}

/**
 * Note: modification of the type `Column` from `react-data-grid`
 */
export type ServerColumn<TRow extends Obj> = {
    name: string
    key: string
    editor: CellType
    editable: CellAccess
}
