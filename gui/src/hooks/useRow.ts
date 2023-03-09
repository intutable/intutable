import { merge } from "@datagrid/RowMask/mergeInputMaskColumn"
import { isLinkDefaultValue } from "@shared/input-masks/utils"
import { fetcher } from "api"
import { TableHookOptions, useTable } from "hooks/useTable"
import { useView, ViewHookOptions } from "hooks/useView"
import { RowsChangeData } from "react-data-grid"
import { Column, Row } from "types"
import SerDes from "utils/SerDes"
import { useColumn } from "./useColumn"
import { useInputMask } from "./useInputMask"
import { useSnacki } from "./useSnacki"
import { useSnapshot } from "./useSnapshot"
import { useUndoManager } from "./useUndoManager"

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
    const { undoManager } = useUndoManager()
    const { captureSnapshot } = useSnapshot()
    const { currentInputMask } = useInputMask()

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
        // TODO: implement default values from input masks
        const withDefaultValues: Record<number, unknown> = {}
        if (view && currentInputMask) {
            const merged = merge(view.columns, currentInputMask.columnProps)
            merged.forEach(inputMaskCol => {
                if (
                    inputMaskCol.defaultValue &&
                    inputMaskCol.defaultValue != null &&
                    inputMaskCol.defaultValue !== ""
                ) {
                    withDefaultValues[inputMaskCol.id] = inputMaskCol.defaultValue
                }
            })
        }

        // BUG: the endpoint is supposed to return data like `{ _id: 0}`
        // but somehow `row` is just a number
        // watch out for this bug
        const row: number = await fetcher({
            url: "/api/row",
            body: {
                viewId: view!.descriptor.id,
                values: {},
                atIndex,
            },
        })
        await mutateTable()
        await mutateView()
        return { _id: row }
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

        const snapshot = captureSnapshot({
            oldValue: previousSerialized as string,
            newValue: serializedValue as string,
            column,
            row,
        })

        undoManager?.addMemento(snapshot)
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

        const snapshot = captureSnapshot({
            oldValue: previousSerialized as string,
            newValue: serializedValue as string,
            column,
            row: previousRow!,
        })

        undoManager?.addMemento(snapshot)
    }

    return {
        onRowReorder,
        createRow,
        deleteRow,
        updateRow,
        updateRow_RDG,
    }
}
