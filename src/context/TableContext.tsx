import React, { useCallback, useContext, useEffect, useState } from "react"
import { useRouter } from "next/router"
import { getTableData, TableData } from "@app/api"
import { useAuth } from "./AuthContext"

export type TableContextProps = {
    loading: boolean
    error: null | Error
    tableData: null | TableData
    currentTable: null | string
    projectTables: string[]
    refresh: () => void
    changeTable: (table: string | null) => void
}
type T = TableContextProps
const initialState: TableContextProps = {
    loading: false,
    error: null,
    tableData: null,
    currentTable: null,
    projectTables: [],
    refresh: () => {},
    changeTable: () => {},
}
const TableContext = React.createContext<TableContextProps>(initialState)

type TableProviderProps = {
    projectName: string
    projectTables: string[]
}

/**
 *
 * @param props
 * @returns
 */
export const TableProvider: React.FC<TableProviderProps> = props => {
    const router = useRouter()
    const { getUserAuthCookie } = useAuth()

    // #################### states ####################

    const [projectTables, setProjectTables] = useState<T["projectTables"]>(
        props.projectTables
    ) // all available tables in a project
    const [currentTable, setCurrentTable] = useState<T["currentTable"]>(null) // the current table, if 'null' it is loading or the project has no tables
    const [tableData, setTableData] = useState<T["tableData"]>(null) // data of the current table
    const [loading, setLoading] = useState<T["loading"]>(false)
    const [error, setError] = useState<T["error"]>(null)

    // #################### private methods ####################

    const fetchData = useCallback(async () => {
        setLoading(true)
        if (getUserAuthCookie && getUserAuthCookie() && currentTable) {
            const authCookie = getUserAuthCookie() || undefined
            const fetchedData = await getTableData(
                currentTable,
                props.projectName,
                authCookie
            )
            setTableData(fetchedData)
        } else {
            setError(
                new Error(
                    "Could not get the user cookie in 'TableContext.tsx:fetchData'!"
                )
            )
        }
        setLoading(false)
    }, [currentTable, getUserAuthCookie])

    // #################### life cycle ####################

    useEffect(() => {
        if (!currentTable && tableData != null) setTableData(null)
        if (currentTable) {
            fetchData()
        }
    }, [currentTable])

    // #################### public methods ####################

    /**
     * Changes the current tables and loads the data.
     * @param {string} table must be in the list of available project tables.
     */
    const changeTable = (table: string | null): void => {
        if (table === null) return setCurrentTable(null)
        if (!projectTables.includes(table))
            throw new RangeError(
                `Table '${table} is not a member of the current project!`
            )
        setCurrentTable(table)
    }

    /**
     * Reloads the data.
     */
    const refresh = () => {}

    // #################### provider ####################

    return (
        <TableContext.Provider
            value={{
                projectTables,
                currentTable,
                tableData,
                loading,
                error,
                changeTable,
                refresh,
            }}
        >
            {props.children}
        </TableContext.Provider>
    )
}

export const useTable = () => React.useContext(TableContext)
