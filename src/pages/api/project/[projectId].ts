import {
    changeProjectName,
    getProjects,
    removeProject,
} from "@intutable/project-management/dist/requests"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { coreRequest } from "api/utils"
import { withSessionRoute } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { makeError } from "utils/makeError"
import { withUserCheck } from "utils/withUserCheck"

/**
 * GET a single project @type {ProjectDescriptor}.
 *
 * @tutorial
 * ```
 * - URL: `/api/project/[id]` e.g. `/api/project/1`
 * ```
 */
const GET = async (
    req: NextApiRequest,
    res: NextApiResponse,
    projectId: ProjectDescriptor["id"]
) => {
    try {
        const user = req.session.user!

        const allProjects = await coreRequest<ProjectDescriptor[]>(
            getProjects(user.id),
            user.authCookie
        )

        const project = allProjects.find(proj => proj.id === projectId)
        if (project == null)
            throw new Error(`could not find project with id: ${projectId}`)

        res.status(200).json(project)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

/**
 * PATCH/update the name of a single project.
 * Returns the updated project {@type {ProjectDescriptor}}.
 *
 * // TODO: In a future version this api point will be able to adjust more than the name.
 *
 * @tutorial
 * ```
 * - URL: `/api/project/[id]` e.g. `/api/project/1`
 * - Body: {
 *  newName: {@type {ProjectDescriptor["name"}}
 * }
 * ```
 */
const PATCH = async (
    req: NextApiRequest,
    res: NextApiResponse,
    projectId: ProjectDescriptor["id"]
) => {
    try {
        const { newName } = req.body as {
            newName: ProjectDescriptor["name"]
        }
        const user = req.session.user!

        // rename project in project-management
        const updatedProject = await coreRequest<ProjectDescriptor>(
            changeProjectName(projectId, newName),
            user.authCookie
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
 * - URL: `/api/project/[id]` e.g. `/api/project/1`
 * ```
 */
const DELETE = async (
    req: NextApiRequest,
    res: NextApiResponse,
    projectId: ProjectDescriptor["id"]
) => {
    try {
        const user = req.session.user!
        // delete project in project-management
        await coreRequest(removeProject(projectId), user.authCookie)

        res.status(200).send({})
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

export default withSessionRoute(
    withUserCheck(async (req: NextApiRequest, res: NextApiResponse) => {
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
    })
)
