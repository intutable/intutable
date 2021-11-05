import { useState, useEffect } from "react"
import type { GridColDef, GridValueGetterParams, GridRowData, GridColumns } from "@mui/x-data-grid"
import { getDataForTable } from "./getData"

export const Tables = ["Personen", "Organe", "Rollen"] as const

export type Table = typeof Tables[number]
export const isTableType = (str: string): str is Table => Tables.includes(str as Table)

export type DataGridDataType = {
    tableType: Table
    rows: Array<GridRowData>
    cols: GridColumns
}
const DataGridDataPlaceholder = {
    row: [],
    col: [{ field: "id", headerName: "ID" }],
}

/**
 * Fetches the data for the specified table and returns it.
 * @param {Table} tableType type of the table .
 * @returns {{DataGridDataType,Dispatch<SetStateAction<Table>>}} Object with the data and a function to change the table type.
 */
export const useTable = (tableType: Table) => {
    const [table, setTable] = useState<Table>(tableType)
    const [data, setData] = useState<DataGridDataType>({
        tableType: tableType,
        rows: DataGridDataPlaceholder.row,
        cols: DataGridDataPlaceholder.col,
    })
    useEffect(() => {
        // fetch data related to table type
        async function getData() {
            const data = await getDataForTable()
            setData(data as any)
        }
        getData()
    }, [table])

    return { data, setTable }
}

// only for dev
export type Data = Array<{ project: string; tables: Array<string> }>
const INITIAL_CHOSEN_PROJECT = 0
const INITIAL_CHOSEN_TABLE = 0

// TODO: this should replace `useTable` and handle both, project and related table names. Should be integrated with user auth hook
export const useProject = (data: Data) => {
    const [project, setProject] = useState<string | null>(
        data[INITIAL_CHOSEN_PROJECT].project || null
    )
    const [projects, setProjects] = useState<Array<string>>(data.map(proj => proj.project))
    const [table, setTable] = useState<string | null>(
        data[INITIAL_CHOSEN_PROJECT].tables[INITIAL_CHOSEN_TABLE] || null
    )
    const [tables, setTables] = useState<Array<string>>(data[INITIAL_CHOSEN_PROJECT].tables)

    const changeProject = (newproj: string) => {
        const relatedTables = data.find(proj => proj.project === newproj)?.tables
        if (projects.includes(newproj) && relatedTables) {
            setProject(newproj)
            setTables(relatedTables)
            setTable(relatedTables[INITIAL_CHOSEN_TABLE])
        }
    }

    const changeTable = (tbl: string) => {
        if (tables.includes(tbl)) setTable(tbl)
    }

    const refresh = (newData: Data, focus?: { project: string; table?: string }) => {
        const PROJECT_FOCUS = focus
            ? newData.findIndex(proj => proj.project === focus.project)
            : INITIAL_CHOSEN_PROJECT
        const TABLE_FOCUS = focus?.table
            ? newData
                  .find(proj => proj.project === focus.project)
                  ?.tables.findIndex(tbl => tbl === focus.table)
            : INITIAL_CHOSEN_TABLE

        setProject(newData[PROJECT_FOCUS ?? INITIAL_CHOSEN_PROJECT].project || null)
        setProjects(newData.map(proj => proj.project))
        setTable(
            data[PROJECT_FOCUS ?? INITIAL_CHOSEN_PROJECT].tables[
                TABLE_FOCUS ?? INITIAL_CHOSEN_TABLE
            ] || null
        )
        setTables(data[PROJECT_FOCUS ?? INITIAL_CHOSEN_PROJECT].tables)
    }

    return {
        project,
        changeProject,
        projects,
        table,
        changeTable,
        tables,
        refresh,
    }
}
