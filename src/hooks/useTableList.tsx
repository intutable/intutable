import { fetchWithUser, Routes } from "api"
import { useAuth } from "context"
import useSWR from "swr"
import type { PMTypes as PM } from "types"

export const useTableList = (project: PM.Project) => {
    const { user, API } = useAuth()

    const {
        data: list,
        error,
        mutate,
    } = useSWR<PM.Table[]>(
        user ? [Routes.get.tableList, user, { projectId: project.id }] : null,
        fetchWithUser
    )

    /**
     * // TODO:
     *  once these api methods return the updatet data, inject it into mutate
     */

    const createTable = async (name: PM.Table.Name): Promise<void> => {
        await API?.post.table(project.id, name)
        await mutate()
    }

    const renameTable = async (
        table: PM.Table,
        name: PM.Table.Name
    ): Promise<void> => {
        await API?.put.tableName(table.id, name)
        await mutate()
    }

    const deleteTable = async (table: PM.Table): Promise<void> => {
        await API?.delete.table(table.id)
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
