import { ViewDescriptor, LinkDescriptor } from "@shared/types/tables"
import { asView } from "@intutable/lazy-views/dist/selectable"
import { useMemo } from "react"
import { Column } from "types"
import { useColumn } from "./useColumn"
import { useTable } from "./useTable"
import { useTables } from "./useTables"

type UseForeignTableReturnType = {
    link: LinkDescriptor | null
    foreignTable: ViewDescriptor | null
}

const initialState: UseForeignTableReturnType = {
    link: null,
    foreignTable: null,
}

/**
 * ???
 */
export const useForeignTable = (forColumn: Column.Deserialized) => {
    const { data: currentTableData } = useTable()
    const { getTableColumn } = useColumn()
    const { tables } = useTables()

    const result = useMemo<UseForeignTableReturnType>(() => {
        if (currentTableData == null || tables == null) return initialState

        const tableColumn = getTableColumn(forColumn)
        if (tableColumn == null) return initialState

        const link = currentTableData.joins.find(join => join.id === tableColumn.linkId)
        if (link == null) return initialState

        const foreignTable = tables.find(table => table.id === asView(link.foreignSource).id)
        if (foreignTable == null) return initialState

        return { foreignTable, link }
    }, [forColumn, currentTableData, getTableColumn, tables])

    return result
}
