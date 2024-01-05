import { CoreRequest, PluginLoader } from "@intutable-org/core"
import { PMResponse, ProcessState, Step, Workflow } from "../types"
import {
    abortWorkflow,
    blockWorkflow,
    CHANNEL,
    deleteWorkflow,
    getWorkflow,
    unblockWorkflow,
} from "../requests"
import { deleteWorkflow as _deleteWorkflow, updateWorkflow } from "../data/InternalTableAccess"

let core: PluginLoader

export function initWorkflowManipulation(_core: PluginLoader) {
    core = _core

    core.listenForRequests(CHANNEL)
        .on(deleteWorkflow.name, manipulateWorkflowState)
        .on(abortWorkflow.name, manipulateWorkflowState)
        .on(blockWorkflow.name, manipulateWorkflowState)
        .on(unblockWorkflow.name, manipulateWorkflowState)
}

async function manipulateWorkflowState({ id, user, method }: CoreRequest): Promise<PMResponse> {
    const workflow: Workflow = (await core.events.request(getWorkflow(id))).workflow

    if (!workflow) {
        return {
            status: 404,
            message: "Workflow id did not match any known workflow.",
        }
    }

    if (workflow.owner !== user.id) {
        return {
            status: 403,
            message: "Provided user is not the owner of the workflow.",
        }
    }

    if (!StateManipulationMethods[method]) {
        return {
            status: 501,
            message: `It seems like the server has not correctly implemented the ${method} method.`,
        }
    }

    return StateManipulationMethods[method](workflow)
        .then((response: PMResponse) => {
            return response
        })
        .catch((error: Error) => {
            return {
                status: 500,
                message: error.message,
            }
        })
}

const StateManipulationMethods: Record<string, (workflow: Workflow) => Promise<PMResponse>> = {
    abortWorkflow: async (workflow: Workflow) => {
        if (workflow.state === ProcessState.Completed) {
            return {
                status: 422,
                message: "Workflow was already completed.",
            }
        }

        if (workflow.state === ProcessState.Aborted) {
            return {
                status: 422,
                message: "Workflow was already aborted.",
            }
        }

        workflow.steps.forEach((step: Step) => {
            if (step.state === ProcessState.NotStarted || step.state === ProcessState.Pending) {
                step.state = ProcessState.Aborted
            }
        })

        await updateWorkflow(
            {
                state: ProcessState.Aborted,
                steps: workflow.steps,
            },
            ["_id", workflow._id]
        )

        const newWorkflow: Workflow = (await core.events.request(getWorkflow(workflow._id)))
            .workflow

        return {
            status: 200,
            workflow: newWorkflow,
        }
    },

    blockWorkflow: async (workflow: Workflow) => {
        if (workflow.state === ProcessState.Completed) {
            return {
                status: 422,
                message: "Workflow was already completed.",
            }
        }

        if (workflow.state === ProcessState.Aborted) {
            return {
                status: 422,
                message: "Workflow was already aborted.",
            }
        }

        if (workflow.state === ProcessState.Blocked) {
            return {
                status: 422,
                message: "Workflow was already blocked.",
            }
        }

        workflow.steps.forEach((step: Step) => {
            if (step.state === ProcessState.Pending) {
                step.state = ProcessState.Blocked
            }
        })

        await updateWorkflow(
            {
                state: ProcessState.Blocked,
                steps: workflow.steps,
            },
            ["_id", workflow._id]
        )

        const newWorkflow: Workflow = (await core.events.request(getWorkflow(workflow._id)))
            .workflow

        return {
            status: 200,
            workflow: newWorkflow,
        }
    },

    deleteWorkflow: async (workflow: Workflow) => {
        await _deleteWorkflow(workflow)

        return { status: 200 }
    },

    unblockWorkflow: async (workflow: Workflow) => {
        if (workflow.state !== ProcessState.Blocked) {
            return {
                status: 422,
                message: "Workflow is not blocked.",
            }
        }

        workflow.steps.forEach((step: Step) => {
            if (step.state === ProcessState.Blocked) {
                step.state = ProcessState.Pending
            }
        })

        await updateWorkflow(
            {
                state: workflow.history.length ? ProcessState.Pending : ProcessState.NotStarted,
                steps: workflow.steps,
            },
            ["_id", workflow._id]
        )

        const newWorkflow: Workflow = (await core.events.request(getWorkflow(workflow._id)))
            .workflow

        return {
            status: 200,
            workflow: newWorkflow,
        }
    },
}
