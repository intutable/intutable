import { ViewDescriptor } from "@intutable/lazy-views"
import { ProjectDescriptor, TableDescriptor } from "@intutable/project-management/dist/types"
import { useRouter } from "next/router"
import { ParsedUrlQuery } from "querystring"
import useSWR from "swr"
import { useProjects } from "./useProjects"

export type APIQueries = {
    projectId: number
    tableId: number
    viewId: number
}

export const parseQuery = <T extends Record<string, unknown>>(
    query: ParsedUrlQuery,
    expectedKeys: string[]
): Partial<T> => {
    const found: Record<string, unknown> = {}

    expectedKeys.forEach(param => {
        if (Object.prototype.hasOwnProperty.call(query, param)) {
            found[param] = query[param]
        }
    })

    return found as Partial<T>
}

export type UseApiHook = {
    projectId?: number
    tableId?: number
    viewId?: number
    project?: ProjectDescriptor | null
    table?: TableDescriptor | null
    view?: ViewDescriptor | null
}

// TODO: integrate page actions into this hook
// TODO: maybe integrate row mask state into this hook
// TODO: maybe integrate input state into this hook
export const useAPI = (): UseApiHook => {
    const router = useRouter()

    const { projectId, tableId, viewId } = parseQuery<APIQueries>(router.query, [
        "projectId",
        "tableId",
        "viewId",
    ])

    const { projects } = useProjects()
    const projectDescriptor = projects?.find(p => p.id == projectId)

    const { data: tables } = useSWR<TableDescriptor[]>(
        projectId || projectDescriptor
            ? { url: `/api/tables/${projectId ?? projectDescriptor?.id}`, method: "GET" }
            : null
    )
    const tableDescriptor = tables?.find(t => t.id == tableId)

    const { data: views } = useSWR<ViewDescriptor[]>(
        tableId || tableDescriptor
            ? { url: `/api/views/${tableId ?? tableDescriptor?.id}`, method: "GET" }
            : null
    )
    const viewDescriptor = views?.find(v => v.id == viewId)

    return {
        projectId,
        tableId,
        viewId,
        project: projectDescriptor,
        table: tableDescriptor as TableDescriptor | null | undefined,
        view: viewDescriptor as ViewDescriptor | null | undefined,
    }
}
