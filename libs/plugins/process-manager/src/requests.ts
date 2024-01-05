import { CoreRequest } from "@intutable-org/core"
import { Workflow } from "./types"
import { User } from "./types/User"

export const CHANNEL = "process-manager"

/**
 * Aborts a workflow with the given id and owner.
 *
 * Response: { success: boolean, reason: string } Contains a confirmation or reason why the workflow could not be aborted.
 * @param {string} workflowId The id of the workflow that should be aborted.
 * @param {User} owner The owner that the workflow belongs to.
 * @returns {CoreRequest} Contains a confirmation or reason why the workflow could not be aborted.
 */
export function abortWorkflow(workflowId: string, owner: User): CoreRequest {
    return {
        channel: CHANNEL,
        method: abortWorkflow.name,
        id: workflowId,
        user: owner,
    }
}

/**
 * Blocks a workflow with the given id and owner.
 *
 * Response: { success: boolean, reason: string } Contains a confirmation or reason why the workflow could not be blocked.
 * @param {string} workflowId The id of the workflow that should be blocked.
 * @param {User} owner The owner that the workflow belongs to.
 * @returns {CoreRequest} Contains a confirmation or reason why the workflow could not be blocked.
 */
export function blockWorkflow(workflowId: string, owner: User): CoreRequest {
    return {
        channel: CHANNEL,
        method: blockWorkflow.name,
        id: workflowId,
        user: owner,
    }
}

/**
 * Deletes a workflow with the given id and owner.
 *
 * Response: { status: number, message?: string } HTTP status code and depending if there was an error,
 * a message why the workflow could not be deleted.
 * @param {string} workflowId The id of the workflow that should be deleted.
 * @param {User} owner The owner that the workflow belongs to.
 * @returns {CoreRequest} Contains a confirmation or reason why the workflow could not be deleted.
 */
export function deleteWorkflow(workflowId: string, owner: User): CoreRequest {
    return {
        channel: CHANNEL,
        method: deleteWorkflow.name,
        id: workflowId,
        user: owner,
    }
}

/**
 * Query all active workflows
 *
 * @returns {CoreRequest} Contains an array of all active workflows
 */
export function getActiveWorkflows(): CoreRequest {
    return {
        channel: CHANNEL,
        method: getActiveWorkflows.name,
    }
}

/**
 * Get workflow with the given id.
 *
 * Response: { PMResponse } The workflow matching the given id.
 * @param {string} workflowId The id of the workflow that should be returned.
 * @returns {CoreRequest} The workflow matching the given id.
 */
export function getWorkflow(workflowId: string): CoreRequest {
    return {
        channel: CHANNEL,
        method: getWorkflow.name,
        workflowId: workflowId,
    }
}

/**
 * Copy workflow with the given id.
 *
 * Response: { Workflow } The workflow matching the given id.
 * @param {string} workflowId The id of the workflow to copy.
 * @returns {CoreRequest} The workflow matching the given id.
 */
export function copyWorkflow(workflowId: string): CoreRequest {
    return {
        channel: CHANNEL,
        method: copyWorkflow.name,
        workflowId: workflowId,
    }
}

/**
 * Get workflow progress of the given id.
 *
 * Response: { name: string, state: ProcessState }[]
 * @param {string} workflowId The id of the workflow the steps should be returned from.
 * @returns {CoreRequest} Array of workflow step names and state.
 */
export function getWorkflowProgress(workflowId: string): CoreRequest {
    return {
        channel: CHANNEL,
        method: getWorkflowProgress.name,
        workflowId,
    }
}

/**
 * Query all workflow templates
 *
 * @returns {CoreRequest} Contains an array of all workflow templates
 */
export function getWorkflowTemplates(): CoreRequest {
    return {
        channel: CHANNEL,
        method: getWorkflowTemplates.name,
    }
}

/**
 * Query all automatic steps
 *
 * @returns {CoreRequest} Contains an array of all automatic steps
 */
export function getAutomaticStepTemplates(): CoreRequest {
    return {
        channel: CHANNEL,
        method: getAutomaticStepTemplates.name,
    }
}

/**
 * Registers a manual action and advances all relevant related workflows.
 *
 * Response: { string[] } workflow ids, that have been changed
 * @param {string} trigger The name of the manual action, also known as trigger property of a step.
 * @param {User} [user] The user that triggered the manual action.
 * @param {string[]} [workflowIds] The workflowIds to advance
 * @returns {CoreRequest} void
 */
export function registerAction(trigger: string, user?: User, workflowIds?: string[]): CoreRequest {
    return {
        channel: CHANNEL,
        method: registerAction.name,
        trigger,
        user,
        workflowIds,
    }
}

/**
 * Unblocks a blocked workflow with the given id and owner.
 *
 * Response: { success: boolean, reason: string } Contains a confirmation or reason why the workflow could not be blocked.
 * @param {string} workflowId The id of the workflow that should be blocked.
 * @param {User} owner The owner that the workflow belongs to.
 * @returns {CoreRequest} Contains a confirmation or reason why the workflow could not be blocked.
 */
export function unblockWorkflow(workflowId: string, owner: User): CoreRequest {
    return {
        channel: CHANNEL,
        method: unblockWorkflow.name,
        id: workflowId,
        user: owner,
    }
}

/**
 * Create a new workflow
 *
 * @returns {CoreRequest} Contains the newly created workflow
 */
export function createUpdateWorkflow(workflow: Workflow): CoreRequest {
    return {
        channel: CHANNEL,
        method: createUpdateWorkflow.name,
        workflow,
    }
}

/**
 * Fetch all items for the given user
 *
 * @returns {CoreRequest} Contains an array of all open items
 */
export function getItemsForUser(user: User): CoreRequest {
    return {
        channel: CHANNEL,
        method: getItemsForUser.name,
        user,
    }
}

/**
 * Activate workflow template with the given id.
 *
 * Response: { PMResponse } If the workflowTemplate could be activated.
 * @param {string} workflowId The id of the workflow that should be activated.
 * @returns {CoreRequest} If the workflowTemplate could be activated.
 */
export function activateWorkflowTemplate(workflowId: string): CoreRequest {
    return {
        channel: CHANNEL,
        method: activateWorkflowTemplate.name,
        workflowId: workflowId,
    }
}

/**
 * Deactivate workflow template with the given id.
 *
 * Response: { PMResponse } If the workflowTemplate could be deactivated.
 * @param {string} workflowId The id of the workflow that should be deactivated.
 * @returns {CoreRequest} If the workflowTemplate could be deactivated.
 */
export function deactivateWorkflowTemplate(workflowId: string): CoreRequest {
    return {
        channel: CHANNEL,
        method: deactivateWorkflowTemplate.name,
        workflowId: workflowId,
    }
}
