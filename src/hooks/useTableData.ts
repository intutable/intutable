import {
    ColumnDescriptor,
    TableDescriptor,
} from "@intutable/project-management/dist/types"
import { fetcher } from "api"
import useSWR from "swr"
import { Column, TableData } from "types"

export const useTableData = (tableId: TableDescriptor["id"]) => {
    const { data, error, mutate } = useSWR<TableData>(
        [`/api/table/${tableId}`, undefined, "GET"],
        fetcher
    )

    const getColumnByKey = (key: Column["key"]): ColumnDescriptor => {
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
