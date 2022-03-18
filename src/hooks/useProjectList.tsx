import { fetchWithUser, Routes } from "api"
import { useAuth } from "context"
import useSWR from "swr"
import type { PMTypes as PM } from "types"

export const useProjectList = () => {
    const { user, API } = useAuth()

    const {
        data: list,
        error,
        mutate,
    } = useSWR<PM.Project[]>(
        user ? [Routes.get.projectList, user, { userId: user.id }] : null,
        fetchWithUser
    )

    /**
     * // TODO:
     *  once these api methods return the updatet data, inject it into mutate
     */

    const createProject = async (name: PM.Project.Name): Promise<void> => {
        await API?.post.project(name)
        await mutate()
    }

    const renameProject = async (
        project: PM.Project,
        newName: PM.Project.Name
    ): Promise<void> => {
        await API?.put.projectName(project.id, newName)
        await mutate()
    }

    const deleteProject = async (project: PM.Project): Promise<void> => {
        await API?.delete.project(project.id)
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
