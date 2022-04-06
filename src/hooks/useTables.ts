import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { JtDescriptor } from "@intutable/join-tables/dist/types"
import { useAuth } from "context"
import useSWR, { unstable_serialize } from "swr"
import { fetchWithUser } from "api"
import { User } from "auth"

export const useTables = (project: ProjectDescriptor) => {
    const { user } = useAuth()

    const {
        data: tables,
        error,
        mutate,
    } = useSWR<JtDescriptor[]>(
        user ? [`/api/tables/${project.id}`, user, undefined, "GET"] : null,
        fetchWithUser
    )

    return { tables, error, mutate }
}

export const useTablesConfig = (project: ProjectDescriptor) => {
    const { user } = useAuth()

    return {
        cacheKey: makeCacheKey(project, user!),
    }
}

export const makeCacheKey = (project: ProjectDescriptor, user: User): string =>
    unstable_serialize([`/api/tables/${project.id}`, user, undefined, "GET"])
