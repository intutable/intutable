import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { JtDescriptor } from "@intutable/join-tables/dist/types"
import { useUser } from "auth"
import useSWR, { unstable_serialize } from "swr"
import { fetch } from "api"
import { User } from "types/User"

export const useTables = (project: ProjectDescriptor) => {
    const { user } = useUser()

    const {
        data: tables,
        error,
        mutate,
    } = useSWR<JtDescriptor[]>(
        user ? [`/api/tables/${project.id}`, user, undefined, "GET"] : null,
        fetch
    )

    return { tables, error, mutate }
}

export const useTablesConfig = (project: ProjectDescriptor) => {
    const { user } = useUser()

    return {
        cacheKey: makeCacheKey(project, user!),
    }
}

export const makeCacheKey = (project: ProjectDescriptor, user: User): string =>
    unstable_serialize([`/api/tables/${project.id}`, user, undefined, "GET"])
