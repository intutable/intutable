import type { ProjectManagement as PM } from "@app/api"
import { useAuth } from "@app/context/AuthContext"
import { useState } from "react"

export const useTableList = (
    project: PM.Project,
    ssrHydrated: PM.Table.List
) => {
    const { user, API } = useAuth()

    const [loading, setLoading] = useState<boolean>(false)
    const [tableList, setTableList] = useState<PM.Table.List>(ssrHydrated)

    // #################### table dispatchers ####################

    const createTable = async (name: PM.Table.Name) => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        try {
            setLoading(true)
            await API.post.table(project.projectId, name)
            await _refresh()
        } finally {
            setLoading(false)
        }
    }

    const renameTable = async (
        table: PM.Table,
        name: PM.Table.Name
    ): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        try {
            setLoading(true)
            await API.put.tableName(table.tableId, name)
            await _refresh()
        } finally {
            setLoading(false)
        }
    }

    const deleteTable = async (table: PM.Table): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        try {
            setLoading(true)
            await API.delete.table(table.tableId)
            await _refresh()
        } finally {
            setLoading(false)
        }
    }

    const _refresh = async () => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        const newTableList = await API.get.tablesList(project.projectId)
        setTableList(newTableList)
    }

    return {
        tableList,
        loading,
        createTable,
        renameTable,
        deleteTable,
    }
}
