import type { ProjectManagement as PM } from "@app/api"
import { rowKeyGetter, SerializableTable } from "@app/components/DataGrid/utils"
import type {
    Column,
    Row,
    SerializedColumn,
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
        setRows(_deserializedTable.rows)
        setColumns(_deserializedTable.columns)
    }

    // #################### column dispatchers ####################

    const partialRowUpdate = async (rows: Row[], data: RowsChangeData<Row>) => {
        try {
            setLoading(true)
            const changedRow = rows[data.indexes[0]]
            // console.log(JSON.stringify(rows))
            // console.log(JSON.stringify(data))  // this will throw! : this is deserialized data which can not be json serialized
            await API!.put.row(props.project, table, ["_id", changedRow._id], {
                [data.column.key]: changedRow[data.column.key],
            })
            setRows(rows)
        } finally {
            setLoading(false)
        }
    }

    // #################### column dispatchers ####################

    const createColumn = async (col: SerializedColumn): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        try {
            setLoading(true)
            await API.post.column(table.tableId, col.key.toLocaleLowerCase())
            await API.put.columnName(table.tableId, col.key, col.name)
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
