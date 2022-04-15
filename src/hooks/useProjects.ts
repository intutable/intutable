import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import useSWR from "swr"

export const useProjects = () => {
    const {
        data: projects,
        error,
        mutate,
    } = useSWR<ProjectDescriptor[]>([`/api/projects`, undefined, "GET"])

    return { projects, error, mutate }
}
