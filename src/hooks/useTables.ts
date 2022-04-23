import { JtDescriptor } from "@intutable/join-tables/dist/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import useSWR from "swr"

export const useTables = (project: ProjectDescriptor | null | undefined) => {
    const {
        data: tables,
        error,
        mutate,
    } = useSWR<JtDescriptor[]>(
        project ? { url: `/api/tables/${project.id}`, method: "GET" } : null
    )

    return { tables, error, mutate }
}
