import { coreRequest } from "@app/api/coreinterface/json"
import type { CurrentUser } from "@context/AuthContext"
import { CHANNEL } from "."

/**
 * Fetches a list with the names of the projects of a user.
 * @param {CurrentUser} user currently logged-in user.
 * @returns {Promise<string[]>} list of project names in case of success, otherwise an error object with error description.
 * @throws {RangeError} if the returned data does not math the type.
 */
export const getProjects = async (user: CurrentUser): Promise<string[]> => {
    const coreResponse = await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        getProjects.name,
        { user: user.username },
        user.authCookie
    )

    return Array.isArray(coreResponse) &&
        coreResponse.every(e => typeof e === "string")
        ? Promise.resolve(coreResponse)
        : Promise.reject(
              new RangeError("Die Projekte konnten nicht geladen werden!")
          )
}

export const createProject = async (
    user: CurrentUser,
    newProject: string
): Promise<void> => {
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        createProject.name,
        { user: user.username, newProject },
        user.authCookie
    )
}

export const removeProject = async (
    user: CurrentUser,
    project: string
): Promise<void> => {
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        removeProject.name,
        { user: user.username, project },
        user.authCookie
    )
}

export const changeProjectName = async (
    user: CurrentUser,
    oldName: string,
    newName: string
): Promise<void> => {
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        changeProjectName.name,
        { user: user.username, oldName, newName },
        user.authCookie
    )
}
