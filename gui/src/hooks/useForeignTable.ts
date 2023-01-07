import { ColumnInfo, JoinDescriptor, ViewDescriptor } from "@intutable/lazy-views"
import { asView } from "@intutable/lazy-views/dist/selectable"
import { useMemo } from "react"
import { Column } from "types"
import { useColumn } from "./useColumn"
import { useTable } from "./useTable"
import { useTables } from "./useTables"

type UseForeignTableReturnType = {
    join: JoinDescriptor | null
    columnInfo: ColumnInfo | null
    foreignTable: ViewDescriptor | null
}

const initialState: UseForeignTableReturnType = {
    join: null,
    columnInfo: null,
    foreignTable: null,
}

/**
 * ???
 */
export const useForeignTable = (forColumn: Column.Deserialized) => {
    const column = forColumn // rename

    const { data: currentTableData } = useTable()
    const { getColumnInfo } = useColumn()
    const { tables } = useTables()

    const result = useMemo<UseForeignTableReturnType>(() => {
        const columnInfo = getColumnInfo(column)
        if (currentTableData == null || columnInfo == null || tables == null) return initialState

        const join = currentTableData.joins.find(join => join.id === columnInfo.joinId)
        if (join == null) return initialState

        const foreignTable = tables.find(table => table.id === asView(join.foreignSource).id)
        if (foreignTable == null) return initialState

        return { foreignTable, join, columnInfo }
    }, [column, currentTableData, getColumnInfo, tables])

    return result
}
