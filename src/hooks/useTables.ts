import { ViewDescriptor } from "@intutable/lazy-views"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import useSWR from "swr"

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

export const useTablesConfig = {
    cacheKey: (projectId: ProjectDescriptor["id"]) => ({
        url: `/api/tables/${projectId}`,
        method: "GET",
    }),
}
