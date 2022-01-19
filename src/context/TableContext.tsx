import React, { useCallback, useContext, useEffect, useState } from "react"
import { useRouter } from "next/router"
import { getListWithTables, getTableData } from "@api/endpoints"
import type { TableData } from "@api/types"
import { useAuth } from "./AuthContext"

export type TableContextProps = {
    loading: boolean
    error: null | Error
    data: {
        __projectName: string
        projectTables: string[]
        currentTable: string | null
        table: TableData | null
    } | null
    refresh: () => Promise<void>
    changeTable: (table: string | null) => void
}
type T = TableContextProps
const initialState: TableContextProps = {
    loading: true,
    error: null,
    data: null,
    refresh: () =>
        Promise.reject(
            new Error("TableContext: Initial State: Internal Error")
        ),
    changeTable: () => new Error("TableContext: Initial State: Internal Error"),
}
const TableContext = React.createContext<TableContextProps>(initialState)

type TableProviderProps = {
    projectName: string
}

/**
 *
 * @param props
 * @returns
 */
export const TableProvider: React.FC<TableProviderProps> = props => {
    const { user } = useAuth()

    // #################### states ####################

    const [data, setData] = useState<T["data"]>(initialState.data)
    const [loading, setLoading] = useState<T["loading"]>(initialState.loading)
    const [error, setError] = useState<T["error"]>(initialState.error)

    // #################### private methods ####################

    const fetchData = /*useCallback(*/ async () => {
        try {
            setLoading(true)
            setError(null)
            if (!user) throw new Error("The user is not logged in!")

            const tablesInProject = await getListWithTables(
                user,
                props.projectName
            )

            const newData: T["data"] = {
                __projectName: props.projectName,
                projectTables: tablesInProject,
                currentTable:
                    tablesInProject.length > 0 ? tablesInProject[0] : null,
                table: null,
            }

            if (tablesInProject[0].length > 0) {
                const tableData: TableData = await getTableData(
                    user,
                    tablesInProject[0],
                    props.projectName
                )
                newData.table = tableData
            }

            console.log("data:", newData)

            // TODO: data is correct, but either setData doesnt work properly or the data doesnt arrive in project-slug

            setData(newData)
        } catch (error) {
            console.error(error)
            setError(
                error instanceof Error
                    ? error
                    : new Error(
                          typeof error === "string"
                              ? error
                              : "Internal Unknown Error: Could not load the Table!"
                      )
            )
        } finally {
            setLoading(false)
        }
    } /*, [getUserAuthCookie, props.projectName, user])*/

    // #################### life cycle methods ####################

    useEffect(() => {
        // initial loading
        if (data === null) {
            console.count("Initial Loading Data")
            fetchData()
        }
    }, [fetchData])

    // #################### public methods ####################

    /**
     * Changes the current tables and loads the data.
     * @param {string} table must be in the list of available project tables.
     */
    const changeTable = async (table: string | null): Promise<void> => {
        if (table && table.length < 1)
            return Promise.reject(
                new RangeError(`Received argument 'table' is empty: ${table}`)
            )

        if (table === null) {
            setData(prev => ({
                __projectName: props.projectName,
                projectTables: prev!.projectTables,
                currentTable: null,
                table: null,
            }))
            return Promise.resolve()
        }

        if (!data!.projectTables.includes(table))
            return Promise.reject(
                new RangeError(
                    `Table '${table} is not a member of the current project!`
                )
            )

        await fetchData()
    }

    /**
     * Reloads the data.
     */
    const refresh = async (switchToTable?: string): Promise<void> => {
        await fetchData()
        setError(null)
        if (switchToTable && switchToTable?.length > 0)
            changeTable(switchToTable)
    }

    // #################### provider ####################

    return (
        <TableContext.Provider
            value={{
                data,
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
