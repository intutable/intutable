import {
    ProjectDescriptor,
    TableDescriptor,
} from "@intutable/project-management/dist/types"
import { fetchWithUser } from "api"
import { User } from "auth"
import { useAuth } from "context"
import useSWR, { unstable_serialize } from "swr"
import { TableData } from "types"

export const useTableData = (tableId: TableDescriptor["id"]) => {
    const { user } = useAuth()

    const { data, error, mutate } = useSWR<TableData>(
        user ? [`/api/table/${tableId}`, user, undefined, "GET"] : null,
        fetchWithUser
    )

    return { data, error, mutate }
}

export const useTableDataConfig = (tableId: TableDescriptor["id"]) => {
    const { user } = useAuth()

    return {
        cacheKey: makeCacheKey(tableId, user!),
    }
}

export const makeCacheKey = (
    tableId: TableDescriptor["id"],
    user: User
): string =>
    unstable_serialize([`/api/table/${tableId}`, user, undefined, "GET"])
