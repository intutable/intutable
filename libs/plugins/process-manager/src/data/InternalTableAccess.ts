import { PluginLoader } from "@intutable-org/core"
import {
    closeConnection,
    deleteRow,
    insert,
    openConnection,
    select,
    update,
} from "@intutable-org/database/dist/requests"
import { AutomaticStepTemplate, Job, ProcessState, Workflow } from "../types"
import { tableNames } from "./schema"
import { USERNAME, PASSWORD } from "../config/connection"
import { Condition, SelectOptions, UpdateOptions } from "@intutable-org/database/dist/types"
import { killAllJobsOfWorkflow } from "../jobs/JobScheduler"

type DatabaseWorkflow = {
    _id: string
    index: number
    name: string
    description: string
    steps: string
    connections: string
    startstep: string
    history: string
    owner: number
    state: string
    majorsteps: string
}

type DatabaseAutomaticStepTemplate = {
    _id: string
    index: number
    trigger: string
    data: string
    helptext: string
}

type DatabaseJob = {
    _id: string
    name: string
    deadline: number
    workflowId: string
    autoaction: string
    stepData: string
    state: string
}

let core: PluginLoader

export function initInternalTableAccess(_core: PluginLoader) {
    core = _core
}

export async function selectWorkflows(selectOptions?: SelectOptions): Promise<Workflow[]> {
    const connectionId = (await core.events.request(openConnection(USERNAME, PASSWORD)))
        .connectionId

    const workflows: DatabaseWorkflow[] = await core.events.request(
        select(connectionId, tableNames.workflows, selectOptions)
    )

    await core.events.request(closeConnection(connectionId))

    return workflows.map((databaseWorkflow: DatabaseWorkflow) => {
        return {
            _id: databaseWorkflow._id,
            index: databaseWorkflow.index,
            name: databaseWorkflow.name,
            description: databaseWorkflow.description,
            steps: databaseWorkflow.steps ? JSON.parse(databaseWorkflow.steps) : [],
            connections: databaseWorkflow.connections
                ? JSON.parse(databaseWorkflow.connections)
                : [],
            startstep: databaseWorkflow.startstep,
            history: databaseWorkflow.history ? JSON.parse(databaseWorkflow.history) : [],
            owner: databaseWorkflow.owner,
            state: databaseWorkflow.state as ProcessState,
            majorsteps: databaseWorkflow.majorsteps ? JSON.parse(databaseWorkflow.majorsteps) : [],
        }
    })
}

export async function selectAutomaticStepTemplates(
    selectOptions?: SelectOptions
): Promise<AutomaticStepTemplate[]> {
    const connectionId = (await core.events.request(openConnection(USERNAME, PASSWORD)))
        .connectionId

    const workflows: DatabaseAutomaticStepTemplate[] = await core.events.request(
        select(connectionId, tableNames.automatic_steps, selectOptions)
    )

    await core.events.request(closeConnection(connectionId))

    return workflows.map((databaseStep: DatabaseAutomaticStepTemplate) => {
        return {
            _id: databaseStep._id,
            index: databaseStep.index,
            trigger: databaseStep.trigger,
            data: JSON.parse(databaseStep.data),
            helptext: databaseStep.helptext,
        }
    })
}

export async function selectJobs(selectOptions?: SelectOptions): Promise<Job[]> {
    const connectionId = (await core.events.request(openConnection(USERNAME, PASSWORD)))
        .connectionId

    const jobs: DatabaseJob[] = await core.events.request(
        select(connectionId, tableNames.jobs, selectOptions)
    )

    await core.events.request(closeConnection(connectionId))

    return jobs.map((databaseJob: DatabaseJob) => {
        return {
            _id: databaseJob._id,
            name: databaseJob.name,
            deadline: databaseJob.deadline,
            workflowId: databaseJob.workflowId,
            autoaction: databaseJob.autoaction,
            stepData: JSON.parse(databaseJob.stepData),
            state: databaseJob.state as ProcessState,
        }
    })
}

export async function insertWorkflows(workflows: Workflow[] | Workflow): Promise<void> {
    const connectionId = (await core.events.request(openConnection(USERNAME, PASSWORD)))
        .connectionId

    if (!Array.isArray(workflows)) {
        workflows = [workflows]
    }

    const databaseWorkflows: DatabaseWorkflow[] = workflows.map((workflow: Workflow) => {
        return {
            _id: workflow._id,
            index: workflow.index,
            name: workflow.name,
            description: workflow.description,
            steps: JSON.stringify(workflow.steps),
            connections: JSON.stringify(workflow.connections),
            startstep: workflow.startstep,
            history: JSON.stringify(workflow.history),
            owner: workflow.owner,
            state: workflow.state,
            majorsteps: JSON.stringify(workflow.majorsteps),
        }
    })

    await core.events.request(insert(connectionId, tableNames.workflows, databaseWorkflows))

    await core.events.request(closeConnection(connectionId))
}

export async function insertJobs(jobs: Job[] | Job): Promise<void> {
    const connectionId = (await core.events.request(openConnection(USERNAME, PASSWORD)))
        .connectionId

    if (!Array.isArray(jobs)) {
        jobs = [jobs]
    }

    const databaseJob: DatabaseJob[] = jobs.map((job: Job) => {
        return {
            _id: job._id,
            name: job.name,
            deadline: job.deadline,
            workflowId: job.workflowId,
            autoaction: job.autoaction,
            stepData: JSON.stringify(job.stepData),
            state: job.state,
        }
    })

    await core.events.request(insert(connectionId, tableNames.jobs, databaseJob))

    await core.events.request(closeConnection(connectionId))
}

export async function updateWorkflow(
    updateData: Record<string, unknown>,
    condition: Condition
): Promise<void> {
    const connectionId = (await core.events.request(openConnection(USERNAME, PASSWORD)))
        .connectionId

    const keysToStringify: string[] = ["steps", "connections", "history", "majorsteps"]

    keysToStringify.forEach((key: string) => {
        if (updateData[key]) {
            updateData[key] = JSON.stringify(updateData[key])
        }
    })

    const updateOptions: UpdateOptions = {
        update: updateData,
        condition: condition,
    }

    await core.events.request(update(connectionId, tableNames.workflows, updateOptions))

    await core.events.request(closeConnection(connectionId))
}

export async function updateJob(
    updateData: Record<string, unknown>,
    condition: Condition
): Promise<void> {
    const connectionId = (await core.events.request(openConnection(USERNAME, PASSWORD)))
        .connectionId

    updateData.stepData = JSON.stringify(updateData.stepData)

    const updateOptions: UpdateOptions = {
        update: updateData,
        condition: condition,
    }

    await core.events.request(update(connectionId, tableNames.jobs, updateOptions))

    await core.events.request(closeConnection(connectionId))
}

export async function deleteWorkflow(workflow: Workflow): Promise<void> {
    const connectionId = (await core.events.request(openConnection(USERNAME, PASSWORD)))
        .connectionId

    await core.events.request(deleteRow(connectionId, tableNames.workflows, ["_id", workflow._id]))

    await core.events.request(closeConnection(connectionId))
    await killAllJobsOfWorkflow(workflow._id)
}

export async function deleteJob(condition: Condition): Promise<void> {
    const connectionId = (await core.events.request(openConnection(USERNAME, PASSWORD)))
        .connectionId

    await core.events.request(deleteRow(connectionId, tableNames.jobs, condition))

    await core.events.request(closeConnection(connectionId))
}
