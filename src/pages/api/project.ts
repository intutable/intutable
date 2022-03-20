import {
    changeProjectName,
    createProject,
    removeProject,
} from "@intutable/project-management/dist/requests"
import { CHANNEL } from "api/constants"
import { coreRequest } from "api/utils"
import { User } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { PMTypes as PM } from "types"
import { makeError } from "utils/makeError"

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, name } = req.body as {
            user: User
            name: PM.Project.Name
        }

        // create project in project-management
        const project = await coreRequest<PM.Project>(
            CHANNEL.PROJECT_MANAGEMENT,
            createProject.name,
            createProject(user.id, name),
            user.authCookie
        )

        res.status(200).json(project)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

const PATCH = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, project, newName } = req.body as {
            user: User
            project: PM.Project
            newName: PM.Table.Name
        }

        // rename project in project-management
        const updatedProject = await coreRequest(
            CHANNEL.PROJECT_MANAGEMENT,
            changeProjectName.name,
            changeProjectName(project.id, newName),
            user.authCookie
        )

        res.status(200).json(updatedProject)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, project } = req.body as {
            user: User
            project: PM.Project
        }

        // delete project in project-management
        await coreRequest(
            CHANNEL.PROJECT_MANAGEMENT,
            removeProject.name,
            removeProject(project.id),
            user.authCookie
        )

        res.status(200).send({})
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "POST":
            POST(req, res)
            break
        case "PATCH":
            PATCH(req, res)
            break
        case "DELETE":
            DELETE(req, res)
            break
        default:
            res.status(["HEAD", "GET"].includes(req.method!) ? 500 : 501).send(
                "This method is not supported!"
            )
    }
}
