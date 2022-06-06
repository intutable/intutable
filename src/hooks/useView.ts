import { useAPI } from "context"
import useSWR, { unstable_serialize } from "swr"
import { ViewData } from "types"
import { useMemo } from "react"
import { BareFetcher, PublicConfiguration } from "swr/dist/types"

import { ViewDescriptor, Condition as Filter } from "@intutable/lazy-views"
import { fetcher } from "api/fetcher"


export type ViewHookOptions = {
    view?: ViewDescriptor
    swrOptions?: Partial<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        PublicConfiguration<ViewData, any, BareFetcher<ViewData>>
    >
}

/**
 * ### useView hook.
 *
 * Returns the data of a view.
 *
 * It uses the {@link APIContextProvider}
 * to determine the current selected view.
 *
 * @param {Partial<PublicConfiguration<ViewData, any, BareFetcher<ViewData>>>} [options.swrOptions] Options for the underlying {@link useSWR} hook.
 *
 * @param {ViewDescriptor} [options.view] If you want to fetch a different
 * view than specified in the api context, you can use this option.
 */
export const useView = (options?: ViewHookOptions) => {
    const { view: currentView } = useAPI()

    // if the table param is specified, use that over the api context
    const viewToFetch = useMemo(
        () => (options?.view ? options.view : currentView),
        [currentView, options?.view]
    )

    const { data, error, mutate, isValidating } = useSWR<ViewData>(
        viewToFetch
            ? {
                  url: `/api/view/${viewToFetch.id}`,
                  method: "GET",
              }
            : null,
        options?.swrOptions
    )

    const updateFilters = async (filters: Filter[]): Promise<void> => {
        if (!currentView) return
        await fetcher({
            url: `/api/view/${currentView.id}/filters`,
            body: { filters },
            method: "PATCH",
        })
        await mutate()
    }

    return {
        data,
        updateFilters,
        error,
        mutate,
        loading: (error == null && data == null) || isValidating,
    }
}

/**
 * Config for `useView` hook.
 */
export const useViewConfig = {
    /**
     * Returns the swr cache key for `useView`.
     * Can be used to ssr data.
     *
     * Note: the key does **not** need to be serialized.
     */
    cacheKey: (viewId: ViewDescriptor["id"]) =>
        unstable_serialize({
            url: `/api/view/${viewId}`,
            method: "GET",
        }),
}
