import { useState, useEffect } from "react"
import type { GridColDef, GridValueGetterParams, GridRowData, GridColumns } from "@mui/x-data-grid"
import { getDataOfTable, TableData } from "./getData"

// only for dev
export type Data = Array<{ project: string; tables: Array<string> }>
const INITIAL_CHOSEN_PROJECT = 0
const INITIAL_CHOSEN_TABLE = 0

// this hook will only handle the projects, tables and its data – no user management or stuff related to this
export const useProject = (data: Data = []) => {
    const [project, setProject] = useState<string | null>(
        data[INITIAL_CHOSEN_PROJECT]?.project ?? null
    )
    const [projects, setProjects] = useState<Array<string>>(data.map(proj => proj.project))
    const [table, setTable] = useState<string | null>(
        data[INITIAL_CHOSEN_PROJECT]?.tables[INITIAL_CHOSEN_TABLE] ?? null
    )
    const [tableData, setTableData] = useState<TableData | null>(null)
    const [tables, setTables] = useState<Array<string>>(data[INITIAL_CHOSEN_PROJECT]?.tables ?? [])

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

    useEffect(() => {
        // TODO: useProject should handle changes and fetch data automatically in `Sprint 2`
        (async _ => {
            if (table) {
                const tableData = await getDataOfTable(table) 
                setTableData(tableData)
            }
        })()
    }, [table])

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
        // project
        project,
        projects,
        changeProject,
        // table
        table,
        tableData,
        tables,
        changeTable,
        // init or update
        refresh,
        init: refresh,
    }
}
