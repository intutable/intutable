import { TableDescriptor } from "@intutable/lazy-views"
import { useAPI, APIContextProvider } from "context"
import useSWR, { unstable_serialize } from "swr"
import { TableData } from "types"
import { ViewDescriptor } from "@intutable/lazy-views"
import { useMemo } from "react"

/**
 * ### useTable hook.
 *
 * Returns the data of a table.
 *
 * It uses the {@link APIContextProvider}
 * to determine the current selected table.
 *
 * __Note__: If you want to fetch a diffrent table than specified in the api context,
 * you can use the optional {@param {TableDescriptor} [options.table]} prop.
 */
export const useTable = (options?: { table?: ViewDescriptor }) => {
    const { table: api_table } = useAPI()

    // if the table param is specified, use that over the api context
    const tableToFetch = useMemo(
        () => (options?.table ? options.table : api_table),
        [api_table, options?.table]
    )

    const { data, error, mutate } = useSWR<TableData>(
        tableToFetch
            ? {
                  url: `/api/table/${tableToFetch.id}`,
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
