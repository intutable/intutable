import { JtDescriptor } from "@intutable/join-tables/dist/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { fetcher } from "api"
import { useEffect } from "react"
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
                  return [`/api/tables/${project.id}`, undefined, "GET"]
              }
            : [`/api/tables/${project.id}`, undefined, "GET"]
    )

    return { tables, error, mutate }
}
