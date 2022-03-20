import {
    changeProjectName,
    getProjects,
    removeProject,
} from "@intutable/project-management/dist/requests"
import { CHANNEL } from "api/constants"
import { coreRequest } from "api/utils"
import { User } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { PMTypes as PM } from "types"
import { makeError } from "utils/makeError"

const GET = async (
    req: NextApiRequest,
    res: NextApiResponse,
    id: PM.Project.ID
) => {
    try {
        const { user } = req.body as {
            user: User
        }

        // get all projects from project-management
        const projects = await coreRequest<PM.Project[]>(
            CHANNEL.PROJECT_MANAGEMENT,
            getProjects.name,
            getProjects(id),
            user.authCookie
        )

        const project = projects.find(proj => proj)
        if (project == null)
            throw new Error(`Could not find project with id: ${id}`)

        res.status(200).json(project)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

const PATCH = async (
    req: NextApiRequest,
    res: NextApiResponse,
    id: PM.Project.ID
) => {
    try {
        const { user, newName } = req.body as {
            user: User
            newName: PM.Table.Name
        }

        // rename project in project-management
        const updatedProject = await coreRequest(
            CHANNEL.PROJECT_MANAGEMENT,
            changeProjectName.name,
            changeProjectName(id, newName),
            user.authCookie
        )

        res.status(200).json(updatedProject)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

const DELETE = async (
    req: NextApiRequest,
    res: NextApiResponse,
    id: PM.Project.ID
) => {
    try {
        const { user } = req.body as {
            user: User
        }

        // delete project in project-management
        await coreRequest(
            CHANNEL.PROJECT_MANAGEMENT,
            removeProject.name,
            removeProject(id),
            user.authCookie
        )

        res.status(200).send({})
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { query, method } = req
    const id = parseInt(query.id as string)

    switch (method) {
        case "GET":
            GET(req, res, id)
            break
        case "PATCH":
            PATCH(req, res, id)
            break
        case "DELETE":
            DELETE(req, res, id)
            break
        default:
            res.setHeader("Allow", ["GET", "PATCH", "DELETE"])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
