import type { ProjectManagement as PM } from "@app/api"
import { useAuth } from "@app/context/AuthContext"
import { useState } from "react"

export const useProjectList = (ssrHydrated: PM.Project.List) => {
    const { user, API } = useAuth()

    const [loading, setLoading] = useState<boolean>(true)
    const [projectList, setProjectList] = useState<PM.Project.List>(ssrHydrated)

    // #################### project dispatchers ####################

    const createProject = async (name: PM.Project.Name): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        try {
            setLoading(true)
            await API.post.project(name)
            await _refresh()
        } finally {
            setLoading(false)
        }
    }

    const renameProject = async (
        project: PM.Project,
        newName: PM.Project.Name
    ): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        try {
            setLoading(true)
            await API.put.projectName(project.projectId, newName)
            await _refresh()
        } finally {
            setLoading(false)
        }
    }

    const deleteProject = async (project: PM.Project): Promise<void> => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        try {
            setLoading(true)
            await API.delete.project(project.projectId)
            await _refresh()
        } finally {
            setLoading(false)
        }
    }

    const _refresh = async () => {
        if (user == null || API == null)
            throw new Error("Could not access the API!")
        const newProjectList = await API?.get.projectsList()
        setProjectList(newProjectList)
    }

    return {
        projectList,
        loading,
        createProject,
        renameProject,
        deleteProject,
    }
}
