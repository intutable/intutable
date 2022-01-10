// This file contains api methods related to projects, e.g. GET POST PUT DELETE

import { coreRequest } from "@app/api/coreinterface/json"
import type { User } from "@context/AuthContext"

/**
 * Fetches a list with the names of the projects of a user.
 * @param {User} user user object.
 * @param {string} authCookie auth cookie. Optional.
 * @returns {Promise<string[]>} list of project names in case of success, otherwise an error object with error description.
 * @throws {RangeError} if the returned data does not math the type.
 */
export const getListWithProjects = async (
    user: User,
    authCookie?: string
): Promise<string[]> => {
    const channel = "project-management"
    const method = "getProjects"
    const body = { user: user.name }
    const cookie = authCookie

    const coreResponse = await coreRequest(channel, method, body, cookie)

    return Array.isArray(coreResponse) &&
        coreResponse.every(e => typeof e === "string")
        ? Promise.resolve(coreResponse)
        : Promise.reject(
              new RangeError("Die Projekte konnten nicht geladen werden!")
          )
}

/**
 * Adds a project to the database.
 * @param user
 * @param project
 * @param authCookie
 * @returns {Promise<void>}
 */
export const addProject = async (
    user: User,
    project: string,
    authCookie?: string
): Promise<void> => {
    const channel = "project-management"
    const method = "createProject"
    const body = { user: user.name, newProject: project }
    const cookie = authCookie

    await coreRequest(channel, method, body, cookie)
    return Promise.resolve()
}

/**
 *
 * @param user
 * @param project
 * @param authCookie
 * @returns
 */
export const deleteProject = async (
    user: User,
    project: string,
    authCookie?: string
): Promise<void> => {
    const channel = "project-management"
    const method = "removeProject"
    const body = { user: user.name, project: project }
    const cookie = authCookie

    await coreRequest(channel, method, body, cookie)
    return Promise.resolve()
}

/**
 *
 * @param user
 * @param project
 * @param newProjectName
 * @param authCookie
 * @returns
 */
export const renameProject = async (
    user: User,
    project: string,
    newProjectName: string,
    authCookie?: string
): Promise<void> => {
    const channel = "project-management"
    const method = "changeProjectName"
    const body = { user: user.name, oldName: project, newName: newProjectName }
    const cookie = authCookie

    await coreRequest(channel, method, body, cookie)
    return Promise.resolve()
}
