import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import useSWR from "swr"

export const useProjects = () => {
    const {
        data: projects,
        error,
        mutate,
    } = useSWR<ProjectDescriptor[]>({ url: `/api/projects`, method: "GET" })

    return { projects, error, mutate }
}

export const useProjectsConfig = {
    cacheKey: { url: `/api/projects`, method: "GET" },
}
