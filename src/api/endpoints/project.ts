import { coreRequest } from "@app/api/utils/coreRequest"
import type { CurrentUser } from "@context/AuthContext"
import { CHANNEL } from "../utils"
import { ProjectManagement as PM } from "../utils/ProjectManagement_TypeAnnotations"

/**
 * Fetches a list with objects each describing a project of a specific user containg an id and name.
 * @param {CurrentUser} user Currently logged in user.
 * @returns {Promise.resolve<PM.Project.List>} List of projects with name and id.
 * @returns {Promise.reject<Error>} If the returned data does not match the expected type.
 */
export const getProjects = async (
    user: CurrentUser
): Promise<PM.Project.List> => {
    const coreResponse = await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        getProjects.name,
        { userId: user.id },
        user.authCookie
    )

    if (Array.isArray(coreResponse) === false)
        throw new Error("Expected an Array!")

    return coreResponse as PM.Project.List
}

export const createProject = async (
    user: CurrentUser,
    newProject: PM.Project.Name
): Promise<void> => {
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        createProject.name,
        { userId: user.id, newProject },
        user.authCookie
    )
}

export const changeProjectName = async (
    user: CurrentUser,
    projectId: PM.Project.ID,
    newName: PM.Project.Name
): Promise<void> => {
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        changeProjectName.name,
        { projectId, newName },
        user.authCookie
    )
}

export const removeProject = async (
    user: CurrentUser,
    projectId: PM.Project.ID
): Promise<void> => {
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        removeProject.name,
        { projectId },
        user.authCookie
    )
}
