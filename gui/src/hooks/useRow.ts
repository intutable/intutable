import { fetcher } from "api"
import { TableHookOptions, useTable } from "hooks/useTable"
import { ViewHookOptions, useView } from "hooks/useView"
import { Column, Row } from "types"
import SerDes from "utils/SerDes"
import { useColumn } from "./useColumn"

import { useSnacki } from "./useSnacki"

type Column = Column.Deserialized

/**
 * ### useRow hook.
 *
 * Provides methods for manipulating rows of a table.
 *
 * It uses the APIContextProvider
 * to determine the current selected table.
 *
 * @param {Partial<PublicConfiguration<TableData, any, BareFetcher<TableData>>>} [options.swrOptions] Options for the underlying {@link useSWR} hook.
 *
 * @param {ViewDescriptor} [options.table] If you want to fetch a diffrent table than specified in the api context, you can use this option.
 */
export const useRow = (tableOptions?: TableHookOptions, viewOptions?: ViewHookOptions) => {
    const { snackError } = useSnacki()

    const { data: table, mutate: mutateTable } = useTable(tableOptions)
    const { data: view, mutate: mutateView } = useView(viewOptions)

    /**
     * Used for row reordering / drag n drop
     * // TODO: implement
     */
    const onRowReorder = (fromIndex: number, toIndex: number) => {
        if (table && view) {
            const newRows = [...view.rows]
            newRows.splice(toIndex, 0, newRows.splice(fromIndex, 1)[0])
            mutateView({ ...view, rows: newRows })
            // await XYZ() // update data
            // mutate() // make sure data is updated
        }
    }

    // TODO: the cache should be mutated differently
    const createRow = async (atIndex?: number): Promise<{ _id: number }> => {
        const row: { _id: number } = await fetcher({
            url: "/api/row",
            body: {
                viewId: view!.descriptor.id,
                values: {},
                atIndex,
            },
        })
        await mutateTable()
        await mutateView()
        return row
    }

    // TODO: the cache should be mutated differently
    // TODO: the state should be updated differently
    const deleteRow = async (row: { _id: number }): Promise<void> => {
        await fetcher({
            url: "/api/row",
            body: {
                viewId: view!.descriptor.id,
                rowsToDelete: row._id,
            },
            method: "DELETE",
        })

        await mutateTable()
        await mutateView()
    }

    // TODO: the cache should be mutated differently
    // TODO: the state should be updated differently
    // TODO: `value` needs a (better) type
    const updateRow = async (
        column: Column,
        row: { _id: number },
        updatedValue: unknown
    ): Promise<void> => {
        const serializedValue = SerDes.serializeRowValue(updatedValue, column)

        // TODO: put this in the api route
        if (!["standard", "link"].includes(column.kind)) {
            snackError(
                "Diese Spalte gehört zu einer anderen Tabelle." +
                    " Änderungen dürfen nur in der Originaltabelle vorgenommen werden."
            )
            return
            // throw Error("attempted to edit data of a different table")
        }

        await fetcher({
            url: "/api/row",
            body: {
                viewId: view!.descriptor.id,
                rowsToUpdate: row._id,
                values: { [column.id]: serializedValue },
            },
            method: "PATCH",
        })
        await mutateTable()
        await mutateView()
    }

    return {
        onRowReorder,
        createRow,
        deleteRow,
        updateRow,
    }
}
