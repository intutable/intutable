import { Routes } from "@api/routes"
import type { ProjectManagement as PM } from "@app/api"
import { fetchWithUser } from "@app/api/fetcher"
import { useAuth } from "@app/context/AuthContext"
import { useState } from "react"
import useSWR from "swr"

export const useTableList = (project: PM.Project) => {
    const { user, API } = useAuth()

    const {
        data: list,
        error,
        mutate,
    } = useSWR<PM.Table.List>(
        user
            ? [Routes.get.tableList, user, { projectId: project.projectId }]
            : null,
        fetchWithUser
    )

    /**
     * // TODO:
     *  once these api methods return the updatet data, inject it into mutate
     */

    const createTable = async (name: PM.Table.Name): Promise<void> => {
        await API?.post.table(project.projectId, name)
        await mutate()
    }

    const renameTable = async (
        table: PM.Table,
        name: PM.Table.Name
    ): Promise<void> => {
        await API?.put.tableName(table.tableId, name)
        await mutate()
    }

    const deleteTable = async (table: PM.Table): Promise<void> => {
        await API?.delete.table(table.tableId)
        await mutate()
    }

    return {
        tableList: list,
        error,
        createTable,
        renameTable,
        deleteTable,
    }
}
