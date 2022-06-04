import { useMemo } from "react"
import { ColumnInfo } from "@intutable/lazy-views/dist/types"
import { TableHookOptions, useTable } from "hooks/useTable"
import { TableRow, TableColumn } from "types"
import { project_management_constants } from "types/type-annotations/project-management"

export type RowPreview = {
    id: number
    text: string
}

/**
 * When manipulating tables that have links to other tables, those other tables
 * are loaded with this hook.
 */
export const useLink = (options: TableHookOptions) => {
    const { data: linkTableData, error, mutate } = useTable(options)

    const getPrimaryColumn = (): ColumnInfo | null => {
        if (linkTableData == null) return null
        return linkTableData.metadata.columns.find(
            c => c.attributes.userPrimary! === 1
        )!
    }

    const getRowId = (row: TableRow): number => {
        const uidColumn = linkTableData!.metadata.columns.find(
            c => c.name === project_management_constants.UID_KEY
        )!
        return row[uidColumn.key] as number
    }

    const getRowPreviews = (): RowPreview[] | null => {
        const primaryColumn = getPrimaryColumn()
        if (primaryColumn == null) return null
        return linkTableData!.rows.map(r => ({
            id: getRowId(r),
            text: r[primaryColumn.key] as string,
        }))
    }

    /**
     * The user-primary column of the linked table. Used for giving a preview
     * of each row. Not to be confused with the back-end, SQL primary column.
     */
    const primaryColumn = useMemo(() => getPrimaryColumn(), [linkTableData])

    /**
     * A "preview" for each row. Currently consists of the value in
     * {@link primaryColumn} plus an ID.
     */
    const rowPreviews = useMemo(() => getRowPreviews(), [linkTableData])

    /**
     * Given a RDG column of the linked table, find the abstract back-end
     * column it corresponds to.
     */
    const getColumn = (column: TableColumn): ColumnInfo => {
        const tableColumn = linkTableData?.metadata.columns.find(
            c => c.key === column.key
        )
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
