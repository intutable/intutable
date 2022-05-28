import { ViewDescriptor } from "@intutable/lazy-views"
import useSWR, { unstable_serialize } from "swr"

/**
 * ### useViews hook.
 *
 * Returns a list of views on a given table.
 */
export const useViews = (table: ViewDescriptor | null | undefined) => {
    const {
        data: views,
        error,
        mutate,
    } = useSWR<ViewDescriptor[]>(
        table ? { url: `/api/views/${table.id}`, method: "GET" } : null
    )

    return { views, error, mutate }
}

/**
 * Config for `useViews` hook.
 */
export const useViewsConfig = {
    /**
     * Returns the swr cache key for `useViewsConfig`.
     * Can be used to ssr data.
     *
     * Note: the key does **not** need to be serialized.
     */
    cacheKey: (tableId: ViewDescriptor["id"]) =>
        unstable_serialize({
            url: `/api/views/${tableId}`,
            method: "GET",
        }),
}
