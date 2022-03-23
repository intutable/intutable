import {
    changeProjectName,
    getProjects,
    removeProject,
} from "@intutable/project-management/dist/requests"
import { coreRequest } from "api/utils"
import { User } from "auth"
import { AUTH_COOKIE_KEY } from "context/AuthContext"
import type { NextApiRequest, NextApiResponse } from "next"
import { PMTypes as PM } from "types"
import { makeError } from "utils/makeError"

/**
 * GET a single project @type {PM.Project}.
 *
 * @tutorial
 * ```
 * - URL: `/api/project/[id]` e.g. `/api/project/[1]`
 * - Body: {
 *  user: {@type {User}}
 * }
 * ```
 */
const GET = async (
    req: NextApiRequest,
    res: NextApiResponse,
    projectId: PM.Project.ID
) => {
    try {
        const { user } = req.body as {
            user: User
        }

        // get all projects from project-management
        const projects = await coreRequest<PM.Project[]>(
            getProjects(projectId),
            user.authCookie
        )

        const project = projects.find(proj => proj)
        if (project == null)
            throw new Error(`Could not find project with id: ${projectId}`)

        res.status(200).json(project)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

/**
 * PATCH/update the name of a single project.
 * Returns the updated project {@type {PM.Project}}.
 *
 * // TODO: In a future version this api point will be able to adjust more than the name.
 *
 * @tutorial
 * ```
 * - URL: `/api/project/[id]` e.g. `/api/project/[1]`
 * - Body: {
 *  user: {@type {User}}
 *  newName: {@type {PM.Table.Name}}
 * }
 * ```
 */
const PATCH = async (
    req: NextApiRequest,
    res: NextApiResponse,
    projectId: PM.Project.ID
) => {
    try {
        const { newName } = req.body as {
            newName: PM.Table.Name
        }

        // rename project in project-management
        const updatedProject = await coreRequest<PM.Project>( // TODO: does not return the proper type
            changeProjectName(projectId, newName),
            req.cookies[AUTH_COOKIE_KEY]
        )

        res.status(200).json(updatedProject)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

/**
 * DELETE a project. Returns an empty object.
 *
 * @tutorial
 * ```
 * - URL: `/api/project/[id]` e.g. `/api/project/[1]`
 * - Body: {
 *  user: {@type {User}}
 * }
 * ```
 */
const DELETE = async (
    req: NextApiRequest,
    res: NextApiResponse,
    projectId: PM.Project.ID
) => {
    try {
        // delete project in project-management
        await coreRequest(
            removeProject(projectId),
            req.cookies[AUTH_COOKIE_KEY]
        )

        res.status(200).send({})
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { query, method } = req
    const projectId = parseInt(query.projectId as string)

    switch (method) {
        case "GET":
            await GET(req, res, projectId)
            break
        case "PATCH":
            await PATCH(req, res, projectId)
            break
        case "DELETE":
            await DELETE(req, res, projectId)
            break
        default:
            res.setHeader("Allow", ["GET", "PATCH", "DELETE"])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
