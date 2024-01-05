import { merge } from "@datagrid/RowMask/mergeInputMaskColumn"
// import { isLinkDefaultValue } from "@shared/input-masks/utils"
import { fetcher } from "api"
import { TableHookOptions, useTable } from "hooks/useTable"
import { useView, ViewHookOptions } from "hooks/useView"
import { RowsChangeData } from "react-data-grid"
import { Column, Row } from "types"
import SerDes from "utils/SerDes"
import { useColumn } from "./useColumn"
import { useInputMask } from "./useInputMask"
import { useSWRConfig } from "swr"
import { useSnacki } from "./useSnacki"
import { useSnapshot } from "./useSnapshot"
import { useUndoManager } from "./useUndoManager"
import Obj from "types/Obj"
import { useRowMask } from "context/RowMaskContext"
import { InputMask } from "@shared/input-masks/types"
import { ViewData } from "types/tables/rdg"

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
    const { inputMask } = useRowMask()
    const { mutate } = useSWRConfig()

    const updateTableCache = (optimisticTableData: unknown) => {
        return mutate(
            {
                url: `/api/table/${table!.descriptor.id}`,
                method: "GET",
            },
            optimisticTableData,
            {
                revalidate: false,
            }
        )
    }
    const updateRemote = (
        method: "GET" | "POST" | "PATCH" | "DELETE",
        data: string | Obj<unknown>
    ) => {
        return fetcher({
            url: "/api/row",
            method: method,
            body: data,
        })
    }

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
        // if a input mask and it has default values for columns specified
        // those will be added to the creation here
        const defaultValues =
            view && inputMask ? getDefaultValues({ viewData: view, inputMask }) : {}

        // BUG: the endpoint is supposed to return data like `{ _id: 0}`
        // but somehow `row` is just a number, watch out for this bug
        const row: number = await fetcher({
            url: "/api/row",
            body: {
                viewId: view!.descriptor.id,
                values: defaultValues,
                atIndex,
            },
        })
        await mutateTable()
        await mutateView()
        return { _id: row }
    }

    // TODO: the state should be updated differently
    const deleteRow = async (row: Row): Promise<void> => {
        await fetcher({
            url: "/api/row",
            method: "DELETE",
            body: {
                viewId: view!.descriptor.id,
                rowsToDelete: row._id,
            },
        })

        await mutateTable()
        await mutateView()
    }

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

        const optimisticViewData = Object.assign({}, view)
        optimisticViewData!.rows.find((optimisticRow: Row) => optimisticRow._id === row._id)![
            column.key
        ] = updatedValue

        const optimisticTableData = Object.assign({}, table)
        optimisticTableData!.rows.find((optimisticRow: Row) => optimisticRow._id === row._id)![
            column.key
        ] = updatedValue

        mutate(
            {
                url: `/api/view/${view!.descriptor.id}`,
                method: "GET",
            },
            updateRemote("PATCH", {
                viewId: view!.descriptor.id,
                rowsToUpdate: row._id,
                values: { [column.id]: serializedValue },
            }).then(() => updateTableCache(optimisticTableData)),
            {
                optimisticData: optimisticViewData,
                revalidate: false,
                populateCache: false,
            }
        ).catch(() => snackError("Update fehlgeschlagen."))

        const snapshot = captureSnapshot({
            oldValue: previousSerialized as string,
            newValue: serializedValue as string,
            column,
            row,
        })

        undoManager?.addMemento(snapshot)
    }

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

        mutate(
            {
                url: `/api/view/${view!.descriptor.id}`,
                method: "GET",
            },
            updateRemote("PATCH", {
                viewId: view!.descriptor.id,
                rowsToUpdate: changedRow._id,
                values: { [column.id]: serializedValue },
            }).then(() =>
                updateTableCache({
                    ...table,
                    rows: updatedRows,
                })
            ),
            {
                optimisticData: {
                    ...view,
                    rows: updatedRows,
                },
                revalidate: false,
                populateCache: false,
            }
        ).catch(() => snackError("Update fehlgeschlagen."))

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

/** util */
const getDefaultValues = (view: {
    viewData: ViewData
    inputMask: InputMask
}): Record<string, unknown> => {
    const { viewData, inputMask } = view
    const withDefaultValues: Record<string, unknown> = {}
    const merged = merge(viewData.columns, inputMask.columnProps)
    merged.forEach(col => {
        if (col.defaultValue && col.defaultValue !== "")
            withDefaultValues[col.id] = col.defaultValue
    })
    return withDefaultValues
}
