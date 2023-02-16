import { fetcher } from "api"
import { useUndo } from "context/UndoContext"
import { TableHookOptions, useTable } from "hooks/useTable"
import { ViewHookOptions, useView } from "hooks/useView"
import { RowsChangeData } from "react-data-grid"
import { Column, Row } from "types"
import SerDes from "utils/SerDes"

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
    const { undoManager } = useUndo()

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
    // TODO: the state should be updated differently
    const createRow = async (atIndex?: number): Promise<void> => {
        await fetcher({
            url: "/api/row",
            body: {
                viewId: view!.descriptor.id,
                values: {},
                atIndex,
            },
        })

        await mutateTable()
        await mutateView()
    }

    // TODO: the cache should be mutated differently
    // TODO: the state should be updated differently
    const deleteRow = async (row: Row): Promise<void> => {
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
    /** only use outside rdg */
    const updateRow = async (column: Column, row: Row, updatedValue: unknown): Promise<void> => {
        const serializedValue = SerDes.serializeRowValue(updatedValue, column)
        const previousValue = row[column.key]
        const previousSerialized = SerDes.serializeRowValue(previousValue, column)

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

        undoManager?.addMemento({
            viewId: view!.descriptor.id,
            rowId: row._id,
            columnId: column.id,
            oldValue: previousSerialized as string,
            newValue: serializedValue as string,
        })
    }

    // TODO: the cache should be mutated differently
    // TODO: the state should be updated differently
    // TODO: `value` needs a (better) type
    /** only use within rdg */
    const updateRow_RDG = async (
        updatedRows: Row[],
        changedData: RowsChangeData<Row>
    ): Promise<void> => {
        const changedRow = updatedRows[changedData.indexes[0]]
        const col = changedData.column
        const updatedValue = changedRow[col.key]
        const column = changedData.column
        const serializedValue = SerDes.serializeRowValue(updatedValue, column)
        const previousRow = view?.rows[changedData.indexes[0]]
        const previousValue = previousRow![column.key]
        const previousSerialized = SerDes.serializeRowValue(previousValue, column)

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
                rowsToUpdate: changedRow._id,
                values: { [column.id]: serializedValue },
            },
            method: "PATCH",
        })
        await mutateTable()
        await mutateView()

        undoManager?.addMemento({
            viewId: view!.descriptor.id,
            rowId: changedRow._id,
            columnId: column.id,
            oldValue: previousSerialized as string,
            newValue: serializedValue as string,
        })
    }

    return {
        onRowReorder,
        createRow,
        deleteRow,
        updateRow,
        updateRow_RDG,
    }
}
