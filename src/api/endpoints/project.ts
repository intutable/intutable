// This file contains api methods related to projects, e.g. GET POST PUT DELETE

import { coreRequest } from "@app/api/endpoints/coreinterface/json"
import type { User } from "@context/AuthContext"

const channel = "project-management"

/**
 * Fetches a list with the names of the projects of a user.
 * @param {User} user user object.
 * @returns {Promise<string[]>} list of project names in case of success, otherwise an error object with error description.
 * @throws {RangeError} if the returned data does not math the type.
 */
export const getProjects = async (user: User): Promise<string[]> => {
    const coreResponse = await coreRequest(
        channel,
        getProjects.name,
        { user: user.name },
        user.cookie
    )

    return Array.isArray(coreResponse) &&
        coreResponse.every(e => typeof e === "string")
        ? Promise.resolve(coreResponse)
        : Promise.reject(
              new RangeError("Die Projekte konnten nicht geladen werden!")
          )
}

export const createProject = async (
    user: User,
    newProject: string
): Promise<void> => {
    await coreRequest(
        channel,
        createProject.name,
        { user: user.name, newProject },
        user.cookie
    )
}

export const removeProject = async (
    user: User,
    project: string
): Promise<void> => {
    await coreRequest(
        channel,
        removeProject.name,
        { user: user.name, project },
        user.cookie
    )
}

export const changeProjectName = async (
    user: User,
    oldName: string,
    newName: string
): Promise<void> => {
    await coreRequest(
        channel,
        changeProjectName.name,
        { user: user.name, oldName, newName },
        user.cookie
    )
}
