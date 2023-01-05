import { fetcher } from "api"
import { useView } from "hooks/useView"
import { useTable } from "hooks/useTable"
import { Row, Column } from "types"
import { useForeignTable } from "./useForeignTable"

export type RowPreview = Pick<Row, "_id" | "index"> & {
    content: unknown
}

/**
 * When manipulating tables that have links to other tables, those other tables
 * are loaded with this hook.
 */
export const useLink = (forColumn: Column.Deserialized) => {
    const { data: homeView } = useView()
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

    /**
     * Link a row in the current table to a row in the foreign table.
     */
    const setLinkValue = async (row: Row, target: RowPreview | null) => {
        if (!homeView) return null
        return fetcher({
            url: "/api/row",
            body: {
                viewId: homeView!.descriptor.id,
                condition: row._id,
                values: { [forColumn.id]: target?._id ?? null },
            },
            method: "PATCH",
        })
    }

    return {
        error,
        mutate,
        linkTableData,
        rowPreviews,
        setLinkValue,
    }
}
