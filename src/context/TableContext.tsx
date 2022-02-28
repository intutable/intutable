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
    const { user, API } = useAuth()

    const { data, error, mutate } = useSWR<TableData>(
        user
            ? [Routes.get.table, user, { tableId: props.table.tableId }]
            : null,
        fetchWithUser
    )

    /**
     * // TODO:
     *  1. once these api methods return the updatet data, inject it into mutate
     *  2. seperate rows to a distinct state (required for performance by rdg)
     */

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
        await API?.post.column(props.table.tableId, col.key.toLocaleLowerCase())
        await API?.put.columnName(
            props.table.tableId,
            col.key.toLowerCase(),
            col.name
        )
        await mutate()
    }

    const renameColumnKey = async (
        key: Column["key"],
        newKey: Column["key"]
    ): Promise<void> => {
        await API?.put.columnKey(props.table.tableId, key, newKey)
        await mutate()
    }

    const renameColumnName = async (
        key: Column["key"],
        newName: PM.Column.Name
    ): Promise<void> => {
        await API?.put.columnName(props.table.tableId, key, newName)
        await mutate()
    }

    const deleteColumn = async (key: Column["key"]): Promise<void> => {
        await API?.delete.column(props.table.tableId, key)
        await mutate()
    }

    return (
        <TableContext.Provider
            value={{
                // states
                data,
                error,
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
