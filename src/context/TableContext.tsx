import type { ProjectManagement as PM } from "@app/api"
import type { Column, SerializedTableData, TableData } from "@app/types/types"
import { SerializableTable } from "@app/components/DataGrid/utils"
import React, { useEffect, useState } from "react"
import { useAuth } from "./AuthContext"

/**
 * // TODO: use a reducer instead of that many methods
 */
export type TableContextProps = {
    tableData: TableData
    loading: boolean
    error: Error | null
    createColumn: (columnName: PM.Column.Name) => Promise<void>
    renameColumn: (
        columnId: PM.Column.ID,
        newName: PM.Column.Name
    ) => Promise<void>
    deleteColumn: (columnId: PM.Column.ID) => Promise<void>
}

const initialState: TableContextProps = {
    tableData: undefined!,
    loading: true,
    error: null,
    createColumn: undefined!,
    renameColumn: undefined!,
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

    const createColumn = async (columnName: PM.Column.Name): Promise<void> => {}

    const renameColumn = async (
        columnId: PM.Column.ID,
        newName: PM.Column.Name
    ): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        try {
            setLoading(true)
            await API.put.columnName(columnId, newName)
        } finally {
            setLoading(false)
        }
    }

    const deleteColumn = async (columnId: PM.Column.ID): Promise<void> => {}

    // #################### utility ####################

    // #################### Provider ####################

    return (
        <TableContext.Provider
            value={{
                // states
                tableData,
                loading,
                error,
                // column dispatchers
                createColumn,
                renameColumn,
                deleteColumn,
            }}
        >
            {props.children}
        </TableContext.Provider>
    )
}
