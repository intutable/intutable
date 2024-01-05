import { fetcher } from "api"
import {
    Workflow,
    PMResponse,
    ProcessState,
    NotificationItem,
    AutomaticStepTemplate,
} from "@intutable-org/process-manager/dist/types"

/**
 * ### useWorkflow hook.
 *
 * Provides methods for manipulating workflows.
 *
 * It uses the APIContextProvider
 * to determine the current workflow.
 */
export const useWorkflow = () => {
    const doWorkflowStep = async (
        trigger?: string,
        workflowIds?: string | string[]
    ): Promise<string[]> => {
        return await fetcher({
            url: "/api/workflow",
            method: "PATCH",
            body: {
                trigger,
                workflowIds,
            },
        })
    }

    const getActiveWorkflows = async (): Promise<Workflow[]> => {
        return await fetcher({
            url: "/api/workflow",
            method: "POST",
            body: {
                method: "getActiveWorkflows",
            },
        })
    }

    const getWorkflowTemplates = async (): Promise<Workflow[]> => {
        return await fetcher({
            url: "/api/workflow",
            method: "POST",
            body: {
                method: "getWorkflowTemplates",
            },
        })
    }

    /**
     * // sorted
     * [
     *     {
     *         name: string,
     *         state: ProcessState
     *     },
     *     {
     *         name: string,
     *         state: ProcessState
     *     },
     *     ...
     * ]
     */
    const getWorkflowProgress = async (
        workflowId: string
    ): Promise<{ name: string; state: ProcessState }[]> => {
        return await fetcher({
            url: "/api/workflow",
            method: "POST",
            body: {
                workflowId,
                method: "getWorkflowProgress",
            },
        })
    }

    const manipulateWorkflowState = async (
        workflowId: string,
        method: string
    ): Promise<PMResponse> => {
        return await fetcher({
            url: "/api/workflow",
            method: "POST",
            body: {
                workflowId,
                method,
            },
        })
    }

    const getAutomaticStepTemplates = async (): Promise<AutomaticStepTemplate[]> => {
        return await fetcher({
            url: "/api/workflow",
            method: "POST",
            body: {
                method: "getAutomaticStepTemplates",
            },
        })
    }

    const createUpdateWorkflow = async (workflow: Workflow): Promise<PMResponse> => {
        return await fetcher({
            url: "/api/workflow",
            method: "POST",
            body: {
                method: "createUpdateWorkflow",
                workflow,
            },
        })
    }

    const getWorkflow = async (workflowId: string): Promise<PMResponse> => {
        return await fetcher({
            url: "/api/workflow",
            method: "POST",
            body: {
                method: "getWorkflow",
                workflowId,
            },
        })
    }

    const copyWorkflow = async (workflowId: string): Promise<PMResponse> => {
        return await fetcher({
            url: "/api/workflow",
            method: "POST",
            body: {
                method: "copyWorkflow",
                workflowId,
            },
        })
    }

    const getItemsForUser = async (): Promise<NotificationItem[]> => {
        return await fetcher({
            url: "/api/workflow",
            method: "POST",
            body: {
                method: "getItemsForUser",
            },
        })
    }

    const activateWorkflowTemplate = async (workflowId: string): Promise<PMResponse> => {
        return await fetcher({
            url: "/api/workflow",
            method: "POST",
            body: {
                method: "activateWorkflowTemplate",
                workflowId,
            },
        })
    }

    const deactivateWorkflowTemplate = async (workflowId: string): Promise<PMResponse> => {
        return await fetcher({
            url: "/api/workflow",
            method: "POST",
            body: {
                method: "deactivateWorkflowTemplate",
                workflowId,
            },
        })
    }

    return {
        doWorkflowStep,
        getActiveWorkflows,
        getWorkflowTemplates,
        getWorkflowProgress,
        abortWorkflow: async (workflowId: string): Promise<PMResponse> =>
            manipulateWorkflowState(workflowId, "abortWorkflow"),
        blockWorkflow: async (workflowId: string): Promise<PMResponse> =>
            manipulateWorkflowState(workflowId, "blockWorkflow"),
        deleteWorkflow: async (workflowId: string): Promise<PMResponse> =>
            manipulateWorkflowState(workflowId, "deleteWorkflow"),
        unblockWorkflow: async (workflowId: string): Promise<PMResponse> =>
            manipulateWorkflowState(workflowId, "unblockWorkflow"),
        getAutomaticStepTemplates,
        createUpdateWorkflow,
        getWorkflow,
        copyWorkflow,
        getItemsForUser,
        activateWorkflowTemplate,
        deactivateWorkflowTemplate,
    }
}
