import { v4 as uuidv4 } from "uuid"
import { CoreRequest, PluginLoader } from "@intutable-org/core"
import { PMResponse, ProcessState, Step, Workflow, NotificationItem } from "../types"
import { CHANNEL, getItemsForUser, getActiveWorkflows } from "../requests"

let core: PluginLoader

export function initNotifications(_core: PluginLoader) {
    core = _core

    core.listenForRequests(CHANNEL).on(getItemsForUser.name, getItemsForUser_)
}

async function getItemsForUser_({ user }: CoreRequest): Promise<PMResponse> {
    const items: NotificationItem[] = []
    const activeWorkflows = await core.events.request(getActiveWorkflows())

    activeWorkflows.forEach((workflow: Workflow) => {
        const activeSteps: Step[] = workflow.steps
            .filter((step: Step) => step.state === ProcessState.Pending)
            .filter((step: Step) => step.responsible === user.id)

        items.push({
            _id: uuidv4(),
            workflow: workflow.name,
            nextSteps: activeSteps,
        })
    })

    return {
        items,
        status: 200,
    }
}
