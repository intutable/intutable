import { fetchWithUser, Routes } from "api"
import { useAuth } from "context"
import React, { useEffect } from "react"
import { RowsChangeData } from "react-data-grid"
import useSWR from "swr"
import { Column, PM as PMKEY, PMTypes as PM, Row, TableData } from "types"
import { DeSerialize } from "api/utils"

export type TableContextProps = {
    data: TableData | undefined
    error: Error | null
    onRowReorder: (sourceIndex: number, targetIndex: number) => void
    createRow: () => Promise<void>
    deleteRow: (rowIndex: number, row: Row) => Promise<void>
    partialRowUpdate: (rows: Row[], data: RowsChangeData<Row>) => Promise<void>
    createColumn: (col: Column.Serialized) => Promise<void>
    renameColumnKey: (
        key: Column["key"],
        newName: PM.Column.Name
    ) => Promise<void>
    renameColumnName: (
        key: Column["key"],
        newName: PM.Column.Name
    ) => Promise<void>
    deleteColumn: (key: Column["key"]) => Promise<void>
}

const initialState: TableContextProps = {
    data: undefined!,
    error: undefined!,
    onRowReorder: undefined!,
    createRow: undefined!,
    deleteRow: undefined!,
    partialRowUpdate: undefined!,
    createColumn: undefined!,
    renameColumnKey: undefined!,
    renameColumnName: undefined!,
    deleteColumn: undefined!,
}

const TableContext = React.createContext<TableContextProps>(initialState)

export const useTableCtx = () => React.useContext(TableContext)

export type TabletCtxProviderProps = {
    project: PM.Project
    table: PM.Table
}

export const TableCtxProvider: React.FC<TabletCtxProviderProps> = props => {
    const { user } = useAuth()

    const { data, error, mutate } = useSWR<TableData>(
        user ? [Routes.get.table, user, { tableId: props.table.id }] : null,
        fetchWithUser
    )

    /**
     * // TODO:
     *  1. once these api methods return the updatet data, inject it into mutate
     *  2. seperate rows to a distinct state (required for performance by rdg)
     */

    // #################### row utils ####################

    const onRowReorder = (fromIndex: number, toIndex: number) => {
        if (data) {
            const newRows = [...data.rows]
            newRows.splice(toIndex, 0, newRows.splice(fromIndex, 1)[0])
            mutate({ ...data, rows: newRows })
            // await XYZ() // update data
            // mutate() // make sure data is updated
        }
    }

    // #################### row ####################

    const createRow = async (): Promise<void> => {
        await API?.post.row(props.project, props.table)
        await mutate()
        // const lastRowIndex = rows.length
        // const deserializedRow = SerializableTable.deserializeRow(
        //     serializedRow,
        //     lastRowIndex
        // )
        // setRows(prev => {
        //     prev.push(deserializedRow)
        //     return prev
        // })
    }

    const deleteRow = async (rowIndex: number, row: Row): Promise<void> => {
        await API?.delete.row(props.project, props.table, [
            PMKEY.UID_KEY,
            row._id,
        ])
        await mutate()
        // todo: filter row and delete by index and then shift them
    }

    const partialRowUpdate = async (
        rows: Row[],
        data: RowsChangeData<Row>
    ): Promise<void> => {
        const changedRow = rows[data.indexes[0]]
        await API?.put.row(
            props.project,
            props.table,
            [PMKEY.UID_KEY, changedRow._id],
            {
                [data.column.key]: changedRow[data.column.key],
            }
        )
        await mutate()
        // setRows(rows)
    }

    // #################### column ####################

    const createColumn = async (col: Column.Serialized): Promise<void> => {
        await API?.post.column(props.table.id, col.key.toLocaleLowerCase())
        await API?.put.columnName(
            props.table.id,
            col.key.toLowerCase(),
            col.name
        )
        await mutate()
    }

    const renameColumnKey = async (
        key: Column["key"],
        newKey: Column["key"]
    ): Promise<void> => {
        await API?.put.columnKey(props.table.id, key, newKey)
        await mutate()
    }

    const renameColumnName = async (
        key: Column["key"],
        newName: PM.Column.Name
    ): Promise<void> => {
        await API?.put.columnName(props.table.id, key, newName)
        await mutate()
    }

    const deleteColumn = async (key: Column["key"]): Promise<void> => {
        await API?.delete.column(props.table.id, key)
        await mutate()
    }

    return (
        <TableContext.Provider
            value={{
                // states
                data,
                error,
                // row utils
                onRowReorder,
                // row
                createRow,
                deleteRow,
                partialRowUpdate,
                // column dispatchers
                createColumn,
                renameColumnKey,
                renameColumnName,
                deleteColumn,
            }}
        >
            {props.children}
        </TableContext.Provider>
    )
}
