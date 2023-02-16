import { ViewDescriptor } from "@intutable/lazy-views"
import { ProjectDescriptor, TableDescriptor } from "@intutable/project-management/dist/types"
import { useRouter } from "next/router"
import { ParsedUrlQuery } from "querystring"
import { useMemo, useState } from "react"

export type APIQueries = {
    projectId: number
    tableId: number
    viewId: number
}

export const parseQuery = <T extends Record<string, unknown>>(
    query: ParsedUrlQuery,
    expectedKeys: string[]
): Partial<T> => {
    const found: Partial<T> = {}

    expectedKeys.forEach(param => {
        if (Object.prototype.hasOwnProperty.call(query, param)) {
            const key = param as keyof T
            found[key] = query[param]
        }
    })

    return found
}

// TODO ASAP : from the tables page, put the view in the url

// TODO: integrate page actions into this hook
// TODO: maybe integrate row mask state into this hook
// TODO: maybe integrate input state into this hook
export const useAPI = () => {
    const router = useRouter()

    const { projectId, tableId, viewId } = parseQuery<APIQueries>(router.query, [
        "projectId",
        "tableId",
        "viewId",
    ])

    return {
        projectId,
        tableId,
        viewId,
    }
}
