import {
    ColumnInfo,
    TableDescriptor,
} from "@intutable/lazy-views"
import useSWR from "swr"
import { Column, TableData } from "types"

export const useTableData = (
    tableId: TableDescriptor["id"] | null | undefined
) => {
    const { data, error, mutate } = useSWR<TableData>(
        tableId
            ? {
                  url: `/api/table/${tableId}`,
                  method: "GET",
              }
            : null
    )

    const getColumnByKey = (key: Column["key"]): ColumnInfo => {
        const column = data!.metadata.columns.find(c => c.key === key)
        if (!column) throw Error(`could not find column with key ${key}`)
        return column
    }

    return {
        data,
        utils: {
            getColumnByKey,
        },
        error,
        mutate,
    }
}
