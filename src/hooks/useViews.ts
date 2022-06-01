import { ViewDescriptor } from "@intutable/lazy-views"
import useSWR, { unstable_serialize } from "swr"
import { fetcher } from "api"
import { useAPI } from "context/APIContext"

/**
 * ### useViews hook.
 *
 * Returns a list of views on a given table.
 */
export const useViews = (table: ViewDescriptor | null | undefined) => {
    const { view: currentView, setView } = useAPI()
    const {
        data: views,
        error,
        mutate,
    } = useSWR<ViewDescriptor[]>(
        table ? { url: `/api/views/${table.id}`, method: "GET" } : null
    )

    /**
     * Create a new view with a given name, returning its descriptor.
     */
    const createView = async (name: string): Promise<ViewDescriptor | null> => {
        if (!table) return null
        const view = await fetcher<ViewDescriptor>({
            url: "/api/view",
            body: {
                tableViewId: table.id,
                name,
            },
            method: "POST",
        })
        return view
    }

    /**
     * Delete a view. If the deleted view is the currently selected one, also
     * set a new current view.
     */
    const deleteView = async (viewId: ViewDescriptor["id"]): Promise<void> => {
        return fetcher<void>({
            url: `/api/view/${viewId}`,
            body: {},
            method: "DELETE",
        }).then(async () => {
            await mutate()
            if (viewId === currentView?.id && views && views.length > 0) {
                setView(views[0])
            }
        })
    }

    return { views, createView, deleteView, error, mutate }
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
