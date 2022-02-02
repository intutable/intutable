import type { ProjectListElement, TableData } from "@api"
import { TableList, TableListElement } from "@api"
import { SerializableTable } from "@app/components/DataGrid/utils"
import React, { useEffect, useState } from "react"
import { useAuth } from "./AuthContext"

/**
 * // TODO: reload automatically whenever an api call is made (perhaps a ctx ie is needed for api)
 */

const makeError = (error: unknown): Error =>
    error instanceof Error
        ? error
        : typeof error === "string"
        ? new Error(error)
        : new Error("Internal Unknown Error: Could not load the Table!")

export type ProjectContextProps = {
    state: {
        project: ProjectListElement
        tableList: TableList
        currentTable: TableData | null
    } | null
    loading: boolean
    error: Error | null
    setProject: (project: ProjectListElement) => Promise<void>
    setTable: (table: TableListElement) => Promise<void>
    /**
     * ### Manually reloads the whole state
     * This will be removed in a further version.
     * @deprecated
     *
     * @param {TableListElement} table if provided, this will reload AND change the currentTable to this prop
     */
    reload: (table?: TableListElement) => Promise<void>
}

const initialState: ProjectContextProps = {
    state: null,
    loading: true,
    error: null,
    setProject: undefined!,
    setTable: undefined!,
    reload: undefined!,
}

const ProjectContext = React.createContext<ProjectContextProps>(initialState)

export const useProjectCtx = () => React.useContext(ProjectContext)

export const ProjectCtxProvider: React.FC = props => {
    const { user, API } = useAuth()

    // #################### states ####################

    const [state, setState] = useState<ProjectContextProps["state"]>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)

    // #################### life cycles ####################

    useEffect(() => {}, [])

    // #################### dispatchers ####################

    const setProject = async (
        project: ProjectListElement,
        table?: TableListElement
    ): Promise<void> => {
        if (project.projectId === state?.project.projectId)
            return Promise.resolve()
        if (user == null || API == null)
            return Promise.reject(new Error("Could not access the API!"))
        if (
            table != null &&
            state?.tableList.find(tbl => tbl.tableId === table!.tableId)
        ) {
            table = undefined
        }

        setLoading(true)
        try {
            const tableList = await API?.get.tablesList(project.projectId)

            // if proj has no tables
            if (tableList.length < 1) {
                setState({
                    project: project,
                    tableList: tableList,
                    currentTable: null,
                })
                return Promise.resolve()
            }

            const selectedTable = table || tableList[0]
            const tableData = await API.get.table(selectedTable.tableId)

            setState({
                project: project,
                tableList: tableList,
                currentTable: SerializableTable.deserialize(tableData),
            })
        } catch (err) {
            setError(makeError(err))
        } finally {
            setLoading(false)
        }
    }

    const setTable = async (table: TableListElement): Promise<void> => {
        if (table.tableId === state?.currentTable?.table.tableId)
            return Promise.resolve()
        if (user == null || API == null)
            return Promise.reject(new Error("Could not access the API!"))
        if (state?.tableList.find(tbl => tbl.tableId === table.tableId)) {
            console.warn(
                `${ProjectContext.displayName}: Tried to switch to table with id '${table.tableId}' but did not found it!`
            )
            return Promise.resolve()
        }

        setLoading(true)
        try {
            const tableData = await API.get.table(table.tableId)
            setState(prev =>
                prev != null
                    ? {
                          ...prev,
                          currentTable:
                              SerializableTable.deserialize(tableData),
                      }
                    : null
            )
        } catch (err) {
            setError(makeError(err))
        } finally {
            setLoading(false)
        }
    }

    const reload = async (table?: TableListElement): Promise<void> => {
        if (state)
            await setProject(state.project, table || state.currentTable?.table)
    }

    return (
        <ProjectContext.Provider
            value={{
                // states
                state,
                loading,
                error,
                // dispatchers
                setProject,
                setTable,
                reload,
            }}
        >
            {props.children}
        </ProjectContext.Provider>
    )
}
