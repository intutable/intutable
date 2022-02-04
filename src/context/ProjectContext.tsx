import type { ProjectManagement as PM, TableData } from "@api"
import { SerializableTable } from "@app/components/DataGrid/utils"
import React, { useEffect, useState } from "react"
import { useAuth } from "./AuthContext"

const makeError = (error: unknown): Error =>
    error instanceof Error
        ? error
        : typeof error === "string"
        ? new Error(error)
        : new Error("Internal Unknown Error: Could not load the Table!")

/**
 * // TODO: use a reducer instead of that many methods
 */
export type ProjectContextProps = {
    state: {
        project: PM.Project
        tableList: PM.Table.List
        currentTable: TableData | null
    } | null
    loading: boolean
    error: Error | null
    setProject: (project: PM.Project) => Promise<void>
    createProject: (name: PM.Project.Name) => Promise<void>
    renameProject: (
        project: PM.Project,
        newName: PM.Project.Name
    ) => Promise<void>
    deleteProject: (project: PM.Project) => Promise<void>
    setTable: (table: PM.Table) => Promise<void>
    createTable: (name: PM.Table.Name) => Promise<void>
    renameTable: (table: PM.Table, newName: PM.Table.Name) => Promise<void>
    deleteTable: (table: PM.Table) => Promise<void>
    createColumn: (columnName: PM.Column.Name) => Promise<void>
    renameColumn: (
        columnId: PM.Column.ID,
        newName: PM.Column.Name
    ) => Promise<void>
    deleteColumn: (columnId: PM.Column.ID) => Promise<void>
    /**
     * ### Manually reloads the whole state
     * This will be removed in a further version.
     * @deprecated
     *
     * @param {PM.Table} table if provided, this will reload AND change the currentTable to this prop
     */
    reload: (table?: PM.Table) => Promise<void>
}
type State = ProjectContextProps["state"]

const initialState: ProjectContextProps = {
    state: null,
    loading: false,
    error: null,
    setProject: undefined!,
    createProject: undefined!,
    renameProject: undefined!,
    deleteProject: undefined!,
    setTable: undefined!,
    createTable: undefined!,
    renameTable: undefined!,
    deleteTable: undefined!,
    createColumn: undefined!,
    renameColumn: undefined!,
    deleteColumn: undefined!,
    reload: undefined!,
}

const ProjectContext = React.createContext<ProjectContextProps>(initialState)
/**
 * Hook that uses the Project Context.
 */
export const useProjectCtx = () => React.useContext(ProjectContext)

export const ProjectCtxProvider: React.FC = props => {
    const { user, API } = useAuth()

    // #################### states ####################

    const [state, setState] = useState<State>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)

    const updateState = <KEY extends keyof NonNullable<State>>(
        key: KEY,
        value: NonNullable<State>[KEY]
    ) => {
        setState(prev =>
            prev == null
                ? null
                : {
                      ...prev,
                      [key]: value,
                  }
        )
    }

    // #################### life cycles ####################

    useEffect(() => {
        if (user == null) {
            setState(null)
            setLoading(false)
            setError(null)
        }
    }, [user])

    // #################### project dispatchers ####################

    // [x] implemented ; [ ] tested
    const setProject = async (
        project: PM.Project,
        table?: PM.Table
    ): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        if (project.projectId === state?.project.projectId) return
        if (
            table != null &&
            state?.tableList.find(tbl => tbl.tableId === table!.tableId)
        ) {
            table = undefined
        }

        try {
            setLoading(true)
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
                currentTable: SerializableTable.deserialize(tableData), // BUG: does not set the table prop
            })
        } finally {
            setLoading(false)
        }
    }

    // [x] implemented ; [ ] tested
    const createProject = async (name: PM.Project.Name): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        try {
            setLoading(true)
            await API.post.project(name)
        } finally {
            setLoading(false)
        }
    }

    // [x] implemented ; [ ] tested
    const renameProject = async (
        project: PM.Project,
        newName: PM.Project.Name
    ): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        try {
            setLoading(true)
            await API.put.projectName(project.projectId, newName)
        } finally {
            setLoading(false)
        }
    }

    // [x] implemented ; [ ] tested
    const deleteProject = async (project: PM.Project): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        try {
            setLoading(true)
            await API.delete.project(project.projectId)
        } finally {
            setLoading(false)
        }
    }

    // #################### table dispatchers ####################

    // [x] implemented ; [ ] tested
    const setTable = async (table: PM.Table): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        if (table.tableId === state?.currentTable?.table.tableId) return
        if (state?.tableList.find(tbl => tbl.tableId === table.tableId) == null)
            throw new RangeError(
                `${ProjectContext.displayName}: Tried to switch to table with id '${table.tableId}' but did not found it!`
            )
        try {
            setLoading(true)
            const tableData = await API.get.table(table.tableId)
            updateState(
                "currentTable",
                SerializableTable.deserialize(tableData)
            )
        } finally {
            setLoading(false)
        }
    }

    // [x] implemented ; [ ] tested
    const createTable = async (newName: PM.Table.Name) => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        if (state?.project.projectId == null)
            throw new Error("Could not access the current project!")
        try {
            setLoading(true)
            await API.post.table(state.project.projectId, newName)
            const newTableList = await API.get.tablesList(
                state.project.projectId
            )
            console.dir(state.tableList)
            updateState("tableList", newTableList)
            console.dir(state.tableList)
        } finally {
            setLoading(false)
        }
    }

    // [x] implemented ; [ ] tested
    const renameTable = async (
        table: PM.Table,
        newName: PM.Table.Name
    ): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        try {
            setLoading(true)
            await API.put.tableName(table.tableId, newName)
        } finally {
            setLoading(false)
        }
    }

    // [x] implemented ; [ ] tested
    const deleteTable = async (table: PM.Table): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        try {
            setLoading(true)
            await API.delete.table(table.tableId)
        } finally {
            setLoading(false)
        }
    }

    // #################### column dispatchers ####################

    // [ ] implemented ; [ ] tested
    const createColumn = async (columnName: PM.Column.Name): Promise<void> => {}

    // [x] implemented ; [ ] tested
    const renameColumn = async (
        columnId: PM.Column.ID,
        newName: PM.Column.Name
    ): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        if (state?.currentTable) throw new Error("No table is set!")
        try {
            setLoading(true)
            await API.put.columnName(columnId, newName)
        } finally {
            setLoading(false)
        }
    }

    // [ ] implemented ; [ ] tested
    const deleteColumn = async (columnId: PM.Column.ID): Promise<void> => {}

    // #################### deprecated dispatchers ####################

    // [ ] implemented ; [ ] tested
    const reload = async (table?: PM.Table): Promise<void> => {
        if (state)
            await setProject(state.project, table || state.currentTable?.table)
    }

    // #################### Provider ####################

    return (
        <ProjectContext.Provider
            value={{
                // states
                state,
                loading,
                error,
                // project dispatchers
                setProject,
                createProject,
                renameProject,
                deleteProject,
                // project dispatchers
                setTable,
                createTable,
                renameTable,
                deleteTable,
                // column dispatchers
                createColumn,
                renameColumn,
                deleteColumn,
                // deprecated
                reload,
            }}
        >
            {props.children}
        </ProjectContext.Provider>
    )
}
