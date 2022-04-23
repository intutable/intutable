import { JtDescriptor } from "@intutable/join-tables/dist/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import useSWR from "swr"

export const useTables = (
    project: ProjectDescriptor,
    deps?: Array<unknown>
) => {
    const {
        data: tables,
        error,
        mutate,
    } = useSWR<JtDescriptor[]>(
        deps
            ? () => {
                  deps.forEach(e => {
                      if (e == null) throw new Error()
                  })
                  return { url: `/api/tables/${project.id}`, method: "GET" }
              }
            : { url: `/api/tables/${project.id}`, method: "GET" }
    )

    return { tables, error, mutate }
}
