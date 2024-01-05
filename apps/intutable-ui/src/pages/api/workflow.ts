import type { NextApiRequest, NextApiResponse } from "next"
import { coreRequest } from "api/utils"
import {
    registerAction,
    getActiveWorkflows,
    getWorkflowTemplates,
    getAutomaticStepTemplates,
    getWorkflowProgress,
    blockWorkflow,
    abortWorkflow,
    deleteWorkflow,
    unblockWorkflow,
    getWorkflow,
    createUpdateWorkflow,
    copyWorkflow,
    getItemsForUser,
    activateWorkflowTemplate,
    deactivateWorkflowTemplate,
} from "@intutable-org/process-manager/dist/requests"
import { PMResponse, Workflow } from "@intutable-org/process-manager/dist/types"
import { withUserCheck } from "api/utils/withUserCheck"
import { withSessionRoute } from "auth"
import { User } from "types/User"
import { CoreRequest } from "@intutable-org/core"

const doWorkflowStep = async (req: NextApiRequest, res: NextApiResponse) => {
    const { trigger, workflowIds } = req.body

    let workflowIdsArray: string[] = workflowIds
    if (workflowIds && !Array.isArray(workflowIdsArray)) {
        workflowIdsArray = [workflowIdsArray]
    }
    const user = req.session.user

    if (!trigger) {
        res.status(500).send("No trigger was provided!")
        return
    }

    const result = await coreRequest(
        registerAction(trigger, user, workflowIdsArray),
        user?.authCookie
    )

    res.status(200).send(result)
}

const getWorkflow_ = async (req: NextApiRequest, res: NextApiResponse) => {
    const user: User | undefined = req.session.user
    const workflowId = req.body.workflowId

    const result: PMResponse = await coreRequest(getWorkflow(workflowId), user?.authCookie)

    res.status(result.status).send(result)
}

const copyWorkflow_ = async (req: NextApiRequest, res: NextApiResponse) => {
    const user: User | undefined = req.session.user
    const workflowId = req.body.workflowId

    const result: Workflow = await coreRequest(copyWorkflow(workflowId), user?.authCookie)

    res.status(201).send(result)
}

const getWorkflows = async (req: NextApiRequest, res: NextApiResponse) => {
    const user: User | undefined = req.session.user
    const method: string = req.body.method

    let pMCoreRequest: CoreRequest

    switch (method) {
        case "getActiveWorkflows":
            pMCoreRequest = getActiveWorkflows()
            break
        case "getWorkflowTemplates":
            pMCoreRequest = getWorkflowTemplates()
            break
        default:
            res.status(501).send(`Method: ${method} is not implemented correctly yet!`)
            return
    }

    const result = await coreRequest(pMCoreRequest, user?.authCookie)
    res.status(200).send(result)
}

const getAutomaticStepTemplates_ = async (req: NextApiRequest, res: NextApiResponse) => {
    const user: User | undefined = req.session.user

    const result = await coreRequest(getAutomaticStepTemplates(), user?.authCookie)
    res.status(200).send(result)
}

const getWorkflowProgress_ = async (req: NextApiRequest, res: NextApiResponse) => {
    const user = req.session.user
    const workflowId = req.body.workflowId

    const result = await coreRequest(getWorkflowProgress(workflowId), user?.authCookie)
    res.status(200).send(result)
}

const createUpdateWorkflow_ = async (req: NextApiRequest, res: NextApiResponse) => {
    const user = req.session.user
    const editedWorkflow = req.body.workflow

    const result: PMResponse = await coreRequest(
        createUpdateWorkflow(editedWorkflow),
        user?.authCookie
    )

    res.status(result.status).send(result)
}

const manipulateWorkflowState = async (req: NextApiRequest, res: NextApiResponse) => {
    const user: User | undefined = req.session.user
    const workflowId: string = req.body.workflowId
    const method: string = req.body.method

    if (!user) {
        res.status(403).send("A User must be provided to manipulate the state of a Workflow.")
        return
    }

    let pMCoreRequest: CoreRequest

    switch (method) {
        case "abortWorkflow":
            pMCoreRequest = abortWorkflow(workflowId, user)
            break
        case "blockWorkflow":
            pMCoreRequest = blockWorkflow(workflowId, user)
            break
        case "deleteWorkflow":
            pMCoreRequest = deleteWorkflow(workflowId, user)
            break
        case "unblockWorkflow":
            pMCoreRequest = unblockWorkflow(workflowId, user)
            break
        default:
            res.status(501).send(`Method: ${method} is not implemented correctly yet!`)
            return
    }

    const result: PMResponse = await coreRequest(pMCoreRequest, user.authCookie)

    res.status(result.status).send(result)
}

const getItemsForUser_ = async (req: NextApiRequest, res: NextApiResponse) => {
    const user = req.session.user

    if (!user) {
        res.status(403).send("A User must be provided to retrieve the connected table data.")
        return
    }

    const result: PMResponse = await coreRequest(getItemsForUser(user), user.authCookie)

    res.status(result.status).send(result.items)
}

const activateWorkflowTemplate_ = async (req: NextApiRequest, res: NextApiResponse) => {
    const user: User | undefined = req.session.user
    const workflowId = req.body.workflowId

    const result: PMResponse = await coreRequest(
        activateWorkflowTemplate(workflowId),
        user?.authCookie
    )

    res.status(result.status).send(result)
}

const deactivateWorkflowTemplate_ = async (req: NextApiRequest, res: NextApiResponse) => {
    const user: User | undefined = req.session.user
    const workflowId = req.body.workflowId

    const result: PMResponse = await coreRequest(
        deactivateWorkflowTemplate(workflowId),
        user?.authCookie
    )

    res.status(result.status).send(result)
}

export default withSessionRoute(
    withUserCheck(async (req, res) => {
        switch (req.method) {
            // TODO: Change assignment of HTTP headers
            case "POST":
                switch (req.body.method) {
                    case "getWorkflow":
                        await getWorkflow_(req, res)
                        break
                    case "getActiveWorkflows":
                    case "getWorkflowTemplates":
                        await getWorkflows(req, res)
                        break
                    case "getAutomaticStepTemplates":
                        await getAutomaticStepTemplates_(req, res)
                        break
                    case "getWorkflowProgress":
                        await getWorkflowProgress_(req, res)
                        break
                    case "abortWorkflow":
                    case "blockWorkflow":
                    case "deleteWorkflow":
                    case "unblockWorkflow":
                        await manipulateWorkflowState(req, res)
                        break
                    case "createUpdateWorkflow":
                        await createUpdateWorkflow_(req, res)
                        break
                    case "copyWorkflow":
                        await copyWorkflow_(req, res)
                        break
                    case "getItemsForUser":
                        await getItemsForUser_(req, res)
                        break
                    case "activateWorkflowTemplate":
                        await activateWorkflowTemplate_(req, res)
                        break
                    case "deactivateWorkflowTemplate":
                        await deactivateWorkflowTemplate_(req, res)
                        break
                    default:
                        res.status(501).send(
                            `This method (${req.body.method}) is not supported yet!`
                        )
                }
                break
            case "PATCH":
                await doWorkflowStep(req, res)
                break
            default:
                res.status(["HEAD", "GET", "DELETE"].includes(req.method!) ? 500 : 501).send(
                    "This method is not supported!"
                )
        }
    })
)
