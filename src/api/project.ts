import { coreRequest } from "@app/api/coreinterface/json"
import type { CurrentUser } from "@context/AuthContext"
import { CHANNEL } from "."
import { ProjectList, ProjectId, ProjectName } from "./API_Types"

/**
 * Fetches a list with objects each describing a project of a specific user containg an id and name.
 * @param {CurrentUser} user Currently logged in user.
 * @returns {Promise.resolve<ProjectList>} List of projects with name and id.
 * @returns {Promise.reject<Error>} If the returned data does not match the expected type.
 */
export const getProjects = async (user: CurrentUser): Promise<ProjectList> => {
    const coreResponse = await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        getProjects.name,
        { userId: user.id },
        user.authCookie
    )

    if (Array.isArray(coreResponse) === false)
        return Promise.reject(new Error("Expected an Array!"))

    return Promise.resolve(coreResponse as ProjectList)
}

export const createProject = async (
    user: CurrentUser,
    newProject: ProjectName
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
    projectId: ProjectId,
    newName: ProjectName
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
    projectId: ProjectId
): Promise<void> => {
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        removeProject.name,
        { projectId },
        user.authCookie
    )
}
