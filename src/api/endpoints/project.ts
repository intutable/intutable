import {
    getProjects as getProjectsR,
    createProject as createProjectR,
    changeProjectName as changeProjectNameR,
    removeProject as removeProjectR
} from "@intutable/project-management/dist/requests"
import { coreRequest } from "api/utils/coreRequest"
import type { User } from "auth"
import { PMTypes as PM } from "types"

/**
 * Fetches a list with objects each describing a project of a specific
 * user containg an id and name.
 * @param {User} user Currently logged in user.
 * @returns {Promise.resolve<PM.Project.List>} List of projects with name
 * and id.
 * @returns {Promise.reject<Error>} If the returned data does not match
 * the expected type.
 */
export const getProjects = async (user: User): Promise<PM.Project[]> => {
    const coreResponse = await coreRequest(
        getProjectsR(user.id),
        user.authCookie
    )

    if (Array.isArray(coreResponse) === false)
        throw new Error("Expected an Array!")

    return coreResponse as PM.Project[]
}

export const createProject = async (
    user: User,
    newProject: PM.Project.Name
): Promise<void> => {
    await coreRequest(createProjectR(user.id, newProject), user.authCookie)
}

export const changeProjectName = async (
    user: User,
    projectId: PM.Project.ID,
    newName: PM.Project.Name
): Promise<void> => {
    await coreRequest(changeProjectNameR(projectId, newName), user.authCookie)
}

export const removeProject = async (
    user: User,
    projectId: PM.Project.ID
): Promise<void> => {
    await coreRequest(removeProjectR(projectId), user.authCookie)
}
