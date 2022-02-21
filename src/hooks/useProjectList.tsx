import type { ProjectManagement as PM } from "@app/api"
import { fetchWithUser } from "@app/api/fetcher"
import { CurrentUser, useAuth } from "@app/context/AuthContext"
import { useEffect, useMemo, useState } from "react"
import useSWR, { Key, useSWRConfig } from "swr"
import { Routes } from "@api/routes"

export const useProjectList = () => {
    const { user, API } = useAuth()

    const {
        data: list,
        error,
        mutate,
    } = useSWR<PM.Project.List>(
        user ? [Routes.get.projectList, user, { userId: user.id }] : null,
        fetchWithUser
    )

    useEffect(() => {
        console.log(list)
    }, [list])

    /**
     * // TODO:
     *
     */

    const createProject = async (name: PM.Project.Name): Promise<void> => {
        await API!.post.project(name)
        await mutate()
    }

    const renameProject = async (
        project: PM.Project,
        newName: PM.Project.Name
    ): Promise<void> => {
        await API!.put.projectName(project.projectId, newName)
        await mutate()
    }

    const deleteProject = async (project: PM.Project): Promise<void> => {
        await API!.delete.project(project.projectId)
        await mutate()
    }

    return {
        projectList: list,
        error,
        createProject,
        renameProject,
        deleteProject,
    }
}
