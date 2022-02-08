import type { ProjectManagement as PM } from "@app/api"
import { SerializableTable } from "@app/components/DataGrid/utils"
import type { Column, SerializedTableData, TableData } from "@app/types/types"
import React, { useCallback, useState } from "react"
import { useAuth } from "./AuthContext"

/**
 * // TODO: use a reducer instead of that many methods
 */
export type TableContextProps = {
    tableData: TableData
    loading: boolean
    error: Error | null
    createColumn: (key: Column["key"]) => Promise<void>
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
    tableData: undefined!,
    loading: true,
    error: null,
    createColumn: undefined!,
    renameColumnKey: undefined!,
    renameColumnName: undefined!,
    deleteColumn: undefined!,
}

const TableContext = React.createContext<TableContextProps>(initialState)

export const useTableCtx = () => React.useContext(TableContext)

export type TabletCtxProviderProps = {
    ssrHydratedTableData: SerializedTableData
}

export const TableCtxProvider: React.FC<TabletCtxProviderProps> = props => {
    const { user, API } = useAuth()

    // #################### states ####################

    const [tableData, setTableData] = useState<TableData>(
        SerializableTable.deserialize(props.ssrHydratedTableData)
    )
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)

    // #################### life cycles ####################

    // #################### column dispatchers ####################

    const createColumn = useCallback(
        async (key: Column["key"]): Promise<void> => {
            if (user == null || API == null)
                throw new Error("Could not access the API!")
            try {
                setLoading(true)
                await API.post.column(
                    tableData.table.tableId,
                    key.toLocaleLowerCase()
                )
            } finally {
                setLoading(false)
            }
        },
        [API, tableData.table.tableId, user]
    )

    const renameColumnKey = useCallback(
        async (key: Column["key"], newKey: Column["key"]): Promise<void> => {
            if (user == null || API == null)
                throw new Error("Could not access the API!")
            try {
                setLoading(true)
                await API.put.columnKey(tableData.table.tableId, key, newKey)
            } finally {
                setLoading(false)
            }
        },
        [API, tableData.table.tableId, user]
    )

    const renameColumnName = useCallback(
        async (key: Column["key"], newName: PM.Column.Name): Promise<void> => {
            if (user == null || API == null)
                throw new Error("Could not access the API!")
            try {
                setLoading(true)
                await API.put.columnName(tableData.table.tableId, key, newName)
            } finally {
                setLoading(false)
            }
        },
        [API, tableData.table.tableId, user]
    )

    const deleteColumn = useCallback(
        async (key: Column["key"]): Promise<void> => {
            if (user == null || API == null)
                throw new Error("Could not access the API!")
            try {
                setLoading(true)
                await API.delete.column(tableData.table.tableId, key)
            } finally {
                setLoading(false)
            }
        },
        [API, tableData.table.tableId, user]
    )

    // #################### utility ####################

    const _reloadTable = async () => {}

    // #################### Provider ####################

    const getContextValue = useCallback(
        () => ({
            // states
            tableData,
            loading,
            error,
            // column dispatchers
            createColumn,
            renameColumnKey,
            renameColumnName,
            deleteColumn,
        }),
        [
            createColumn,
            deleteColumn,
            error,
            loading,
            renameColumnKey,
            renameColumnName,
            tableData,
        ]
    )

    return (
        <TableContext.Provider value={getContextValue()}>
            {props.children}
        </TableContext.Provider>
    )
}
