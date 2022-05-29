import { useMemo } from "react"
import { ColumnInfo } from "@intutable/lazy-views/dist/types"
import { TableHookOptions, useTable } from "hooks/useTable"
import { Row } from "types"
import { project_management_constants } from "types/type-annotations/project-management"

export type RowPreview = {
    id: number
    text: string
}

export const useLink = (options: TableHookOptions) => {
    const { data: linkTableData, error, mutate } = useTable(options)

    const getPrimaryColumn = (): ColumnInfo | null => {
        if (linkTableData == null) return null
        return linkTableData.metadata.columns.find(
            c => c.attributes.userPrimary! === 1
        )!
    }

    const getRowId = (row: Row): number => {
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
    const primaryColumn = useMemo(
        () => getPrimaryColumn(),
        [linkTableData]
    )

    /**
     * A "preview" for each row. Currently consists of the value in
     * {@link primaryColumn} plus an ID.
     */
    const rowPreviews = useMemo(
        () => getRowPreviews(),
        [linkTableData]
    )

    return {
        error,
        mutate,
        primaryColumn,
        rowPreviews
    }
}
