// Node Modules
import { useState, useEffect } from "react"

import type {
  GridColDef,
  GridValueGetterParams,
  GridRowData,
  GridColumns }            from "@mui/x-data-grid"
import { getDataForTable } from "./getData"

export const Tables = ["Personen", "Organe", "Rollen"] as const
export type Table = typeof Tables[number]
export const isTableType = (str: string): str is Table =>
  Tables.includes(str as Table)
export type DataGridDataType = {
    tableType: Table
    rows: Array<GridRowData>
    cols: GridColumns
}
const DataGridDataPlaceholder = {
    row: [],
    col: [{ field: "id", headerName: "ID" }]
}

/**
 * Fetches the data for the specified table and returns it.
 * @param {Table} tableType type of the table .
 * @returns {{DataGridDataType,Dispatch<SetStateAction<Table>>}} Object with the data and a function to change the table type.
 */
export const useTable = (tableType: Table) => {

    const [table, setTable] = useState<Table>(tableType)
    const [data, setData] = useState<DataGridDataType>({ tableType: tableType, rows: DataGridDataPlaceholder.row, cols: DataGridDataPlaceholder.col })

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

