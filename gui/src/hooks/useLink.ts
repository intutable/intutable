import { RawColumn } from "@shared/types"
import { useTable } from "hooks/useTable"
import { TableColumn, Row, Column } from "types"
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

    /** user defined primary key column in the foreign table */
    const userPrimaryKeyColumn = linkTableData?.columns.find(column => column.isUserPrimaryKey) ?? null

    /** a preview of linkable rows from the foreign table */
    const rowPreviews: RowPreview[] =
        (userPrimaryKeyColumn &&
            linkTableData?.rows.map(row => ({
                _id: row._id,
                index: row.index,
                content: row[userPrimaryKeyColumn.key],
            }))) ??
        []

    const getColumnInfo = (column: TableColumn): RawColumn | null => {
        return linkTableData?.metadata.columns.find(c => c.key === column.key) ?? null
    }

    return {
        error,
        mutate,
        linkTableData,
        rowPreviews,
        getColumnInfo,
    }
}
