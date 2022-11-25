import { useMemo, useCallback } from "react"
import { ColumnInfo } from "@intutable/lazy-views/dist/types"
import { TableHookOptions, useTable } from "hooks/useTable"
import { TableRow, TableColumn, Row, Column } from "types"
import { useForeignTable } from "./useForeignTable"

export type RowPreview = Pick<Row, "_id" | "index"> & {
    content: unknown
}

/**
 * When manipulating tables that have links to other tables, those other tables
 * are loaded with this hook.
 */
export const useLink = (forColumn: Column.Deserialized) => {
    const { foreignTable } = useForeignTable(forColumn)
    const { data: linkTableData, error, mutate } = useTable({ table: foreignTable })

    /** @deprecated */
    const getPrimaryColumn = useCallback((): ColumnInfo | null => {
        if (linkTableData == null) return null
        return linkTableData.metadata.columns.find(c => c.attributes.isUserPrimaryKey! === 1)!
    }, [linkTableData])

    const userPrimaryKeyColumn = linkTableData?.columns.find(column => column.isUserPrimaryKey) ?? null

    const getRowPreviews = useCallback((): RowPreview[] | null => {
        const primaryColumn = getPrimaryColumn()
        if (primaryColumn == null) return null
        return linkTableData!.rows.map(row => ({
            _id: row._id,
            index: row.index,
            content: row[primaryColumn.key],
        }))
    }, [linkTableData, getPrimaryColumn])

    /**
     * The user-primary column of the linked table. Used for giving a preview
     * of each row. Not to be confused with the back-end, SQL primary column.
     */
    const primaryColumn = useMemo(() => getPrimaryColumn(), [getPrimaryColumn])

    /**
     * A "preview" for each row. Currently consists of the value in
     * {@link primaryColumn} plus an ID.
     */
    const rowPreviews = useMemo(() => getRowPreviews(), [getRowPreviews])

    /**
     * Given a RDG column of the linked table, find the abstract back-end
     * column it corresponds to.
     */
    const getColumn = (column: TableColumn): ColumnInfo => {
        const tableColumn = linkTableData?.metadata.columns.find(c => c.key === column.key)
        if (!tableColumn) throw Error("no column with key ${column.key} found")
        return tableColumn
    }
    return {
        error,
        mutate,
        linkTableData,
        primaryColumn,
        rowPreviews,
        getColumn,
    }
}
