import { JtDescriptor } from "@intutable/join-tables/dist/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { fetcher } from "api"
import useSWR, { unstable_serialize } from "swr"

export const useTables = (project: ProjectDescriptor) => {
    const {
        data: tables,
        error,
        mutate,
    } = useSWR<JtDescriptor[]>(
        [`/api/tables/${project.id}`, undefined, "GET"],
        fetcher
    )

    return { tables, error, mutate }
}

export const useTablesConfig = (project: ProjectDescriptor) => ({
    cacheKey: makeCacheKey(project),
})

export const makeCacheKey = (project: ProjectDescriptor): string =>
    unstable_serialize([`/api/tables/${project.id}`, undefined, "GET"])
