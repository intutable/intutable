import { ViewDescriptor } from "@intutable/lazy-views"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import useSWR, { unstable_serialize } from "swr"

/**
 * ### useTables hook.
 *
 * Returns a list of tables of a project.
 */
export const useTables = (project: ProjectDescriptor | null | undefined) => {
    const {
        data: tables,
        error,
        mutate,
    } = useSWR<ViewDescriptor[]>(
        project ? { url: `/api/tables/${project.id}`, method: "GET" } : null
    )

    return { tables, error, mutate }
}

/**
 * Config for `useTables` hook.
 */
export const useTablesConfig = {
    /**
     * Returns the swr cache key for `useTablesConfig`.
     * Can be used to ssr data.
     *
     * Note: the key does **not** neet to be serialized.
     */
    cacheKey: (projectId: ProjectDescriptor["id"]) =>
        unstable_serialize({
            url: `/api/tables/${projectId}`,
            method: "GET",
        }),
}
