// This file contains api methods related to projects, e.g. GET POST PUT DELETE

import { coreRequest } from "@app/api/coreinterface/json"
import type { User } from "@context/AuthContext"

/**
 * Fetches a list with the names of the projects of a user.
 * @param {User} user user object.
 * @param {string} authCookie auth cookie. Optional.
 * @returns {Promise<Array<string>>} list of project names in case of success, otherwise an error object with error description.
 */
export const getListWithProjects = async (
    user: User,
    authCookie?: string
): Promise<Array<string>> => {
    const channel = "project-management"
    const method = "getProjects"
    const body = { user: user.name }
    const cookie = authCookie

    const coreResponse = await coreRequest(channel, method, body, cookie)

    return Array.isArray(coreResponse) &&
        coreResponse.every(element => typeof element === "string")
        ? Promise.resolve(coreResponse)
        : Promise.reject(new Error())
}

/**
 * Adds a project to the database.
 * // TODO: implement
 * @param user
 * @param project
 * @param authCookie
 * @returns
 */
export const addProject = async (
    user: User,
    project: string,
    authCookie?: string
): Promise<true> => {
    const channel = "project-management"
    const method = "addProject"
    const body = { user: user.name, newProject: project }
    const cookie = authCookie

    const coreResponse = await coreRequest(channel, method, body, cookie)

    return Promise.resolve(true)
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
): Promise<true> => {
    const channel = "project-management"
    const method = "removeProject"
    const body = { user: user.name, project: project }
    const cookie = authCookie

    const coreResponse = await coreRequest(channel, method, body, cookie)

    return Promise.resolve(true)
}

/**
 *
 * @param user
 * @param project
 * @param newProject
 * @param authCookie
 * @returns
 */
export const renameProject = async (
    user: User,
    project: string,
    newProject: string,
    authCookie?: string
): Promise<true> => {
    const channel = "project-management"
    const method = "removeProject"
    const body = { user: user.name, oldName: project, newName: newProject }
    const cookie = authCookie

    const coreResponse = await coreRequest(channel, method, body, cookie)

    return Promise.resolve(true)
}
