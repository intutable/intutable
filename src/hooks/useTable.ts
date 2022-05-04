import { TableDescriptor } from "@intutable/lazy-views"
import { useAPI } from "context"
import useSWR, { unstable_serialize } from "swr"
import { TableData } from "types"

/**
 * useTable Hook
 */
export const useTable = () => {
    const { table } = useAPI()

    const { data, error, mutate } = useSWR<TableData>(
        table
            ? {
                  url: `/api/table/${table.id}`,
                  method: "GET",
              }
            : null
    )

    return {
        data,
        error,
        mutate,
    }
}

/**
 * Config for `useTable` hook.
 */
export const useTableConfig = {
    /**
     * Returns the swr cache key for `useTable`.
     * Can be used to ssr data.
     *
     * Note: the key does **not** neet to be serialized.
     */
    cacheKey: (tableId: TableDescriptor["id"]) =>
        unstable_serialize({
            url: `/api/table/${tableId}`,
            method: "GET",
        }),
}
