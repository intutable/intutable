import {
    ColumnDescriptor,
    ProjectDescriptor,
    TableDescriptor,
} from "@intutable/project-management/dist/types"
import { fetchWithUser } from "api"
import { User } from "types/User"
import { useUser } from "auth"
import useSWR, { unstable_serialize } from "swr"
import { Column, TableData } from "types"

export const useTableData = (tableId: TableDescriptor["id"]) => {
    const { user } = useUser()

    const { data, error, mutate } = useSWR<TableData>(
        user ? [`/api/table/${tableId}`, user, undefined, "GET"] : null,
        fetchWithUser
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

export const useTableDataConfig = (tableId: TableDescriptor["id"]) => {
    const { user } = useUser()

    return {
        cacheKey: makeCacheKey(tableId, user!),
    }
}

export const makeCacheKey = (
    tableId: TableDescriptor["id"],
    user: User
): string =>
    unstable_serialize([`/api/table/${tableId}`, user, undefined, "GET"])
