import { ColumnInfo, TableDescriptor } from "@intutable/lazy-views"
import useSWR from "swr"
import { Column, TableData } from "types"

export const useTable = (tableId: TableDescriptor["id"] | null | undefined) => {
    const { data, error, mutate } = useSWR<TableData>(
        tableId
            ? {
                  url: `/api/table/${tableId}`,
                  method: "GET",
              }
            : null
    )

    return {
        data,
        error,
        utils: error,
        mutate,
    }
}
