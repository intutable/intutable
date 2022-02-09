import type { ProjectManagement as PM } from "@app/api"
import { __KEYS__ } from "@app/types/types"
import { rowKeyGetter, SerializableTable } from "@app/components/DataGrid/utils"
import type {
    Column,
    Row,
    SerializedColumn,
    SerializedRow,
    SerializedTableData,
    TableData,
} from "@app/types/types"
import React, { useCallback, useState } from "react"
import { RowsChangeData } from "react-data-grid"
import { useAuth } from "./AuthContext"
/**
 * // TODO: use a reducer instead of that many methods
 */
export type TableContextProps = {
    table: PM.Table
    rows: Row[]
    columns: Column[]
    loading: boolean
    error: Error | null
    createRow: () => Promise<void>
    partialRowUpdate: (rows: Row[], data: RowsChangeData<Row>) => Promise<void>
    createColumn: (col: SerializedColumn) => Promise<void>
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
    table: undefined!,
    rows: [],
    columns: [{ key: "id", name: "ID" }],
    loading: true,
    error: null,
    createRow: undefined!,
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
    ssrHydratedTableData: SerializedTableData
}

export const TableCtxProvider: React.FC<TabletCtxProviderProps> = props => {
    const { user, API } = useAuth()
    const deserializedTableData = SerializableTable.deserialize(
        props.ssrHydratedTableData
    )

    // #################### states ####################

    const [table, setTable] = useState<TableData["table"]>(
        deserializedTableData.table
    )
    const [rows, setRows] = useState<TableData["rows"]>(
        deserializedTableData.rows
    )
    const [columns, setColumns] = useState<TableData["columns"]>(
        deserializedTableData.columns
    )
    const [loading, setLoading] = useState<boolean>(false)
    const [error] = useState<Error | null>(null)

    // #################### life cycles ####################

    // #################### utility ####################

    /**
     * Split this up into partial updates.
     * @deprecated
     */
    const _reloadTable = async () => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        const _table = await API.get.table(table.tableId)
        const _deserializedTable = SerializableTable.deserialize(_table)
        setTable(_deserializedTable.table)
        setColumns(_deserializedTable.columns)
        setRows(_deserializedTable.rows)
    }

    // #################### row dispatchers ####################

    const createRow = async (): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        try {
            // const uid: typeof __KEYS__.UID_KEY = await API.post.row()
            // const deser
            // TODO: allow deserializing rows
            // setRows(prev => {
            //     return prev.push()
            // })
        } catch (err) {
            console.error(err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const partialRowUpdate = async (
        rows: Row[],
        data: RowsChangeData<Row>
    ): Promise<void> => {
        const changedRow = rows[data.indexes[0]]
        await API!.put.row(
            props.project,
            table,
            [__KEYS__.UID_KEY, changedRow[__KEYS__.UID_KEY]],
            {
                [data.column.key]: changedRow[data.column.key],
            }
        )
        setRows(rows)
    }

    // #################### column dispatchers ####################

    const createColumn = async (col: SerializedColumn): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        try {
            setLoading(true)
            await API.post.column(table.tableId, col.key.toLocaleLowerCase())
            await API.put.columnName(
                table.tableId,
                col.key.toLowerCase(),
                col.name
            )
            await _reloadTable()
        } finally {
            setLoading(false)
        }
    }

    const renameColumnKey = async (
        key: Column["key"],
        newKey: Column["key"]
    ): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        try {
            setLoading(true)
            await API.put.columnKey(table.tableId, key, newKey)
            await _reloadTable()
        } finally {
            setLoading(false)
        }
    }

    const renameColumnName = async (
        key: Column["key"],
        newName: PM.Column.Name
    ): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        try {
            setLoading(true)
            await API.put.columnName(table.tableId, key, newName)
            await _reloadTable()
        } finally {
            setLoading(false)
        }
    }

    const deleteColumn = async (key: Column["key"]): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        try {
            setLoading(true)
            await API.delete.column(table.tableId, key)
            await _reloadTable()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // #################### Provider ####################

    const getContextValue = () => ({
        // states
        table,
        rows,
        columns,
        loading,
        error,
        // row
        createRow,
        partialRowUpdate,
        // column dispatchers
        createColumn,
        renameColumnKey,
        renameColumnName,
        deleteColumn,
    })

    return (
        <TableContext.Provider value={getContextValue()}>
            {props.children}
        </TableContext.Provider>
    )
}
