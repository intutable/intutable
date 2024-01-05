import { v4 as uuidv4 } from "uuid"
import { CoreRequest, CoreResponse, PluginLoader } from "@intutable-org/core"
import { AutomaticSteps } from "./AutomaticSteps"
import {
    Step,
    Workflow,
    ProcessState,
    StepType,
    PMResponse,
    TimeUnit,
    AutomaticStepTemplate,
} from "../types"
import {
    CHANNEL,
    getActiveWorkflows,
    getWorkflow,
    getWorkflowProgress,
    getWorkflowTemplates,
    getAutomaticStepTemplates,
    registerAction,
    createUpdateWorkflow,
    copyWorkflow,
    activateWorkflowTemplate,
    deactivateWorkflowTemplate,
} from "../requests"
import {
    insertWorkflows,
    selectAutomaticStepTemplates,
    selectWorkflows,
    updateWorkflow,
} from "../data/InternalTableAccess"
import { createJob } from "../jobs/JobScheduler"
import { MailOptions } from "@intutable-org/mail-plugin/dist/types"
import { sendMail } from "@intutable-org/mail-plugin/dist/requests"

let core: PluginLoader
let workflowIndexCounter = 42 // TODO

export function initWorkflowManager(_core: PluginLoader) {
    core = _core

    core.listenForRequests(CHANNEL)
        .on(getWorkflow.name, getWorkflow_)
        .on(registerAction.name, registerAction_)
        .on(getActiveWorkflows.name, getActiveWorkflows_)
        .on(getWorkflowTemplates.name, getWorkflowTemplates_)
        .on(getAutomaticStepTemplates.name, getAutomaticStepTemplates_)
        .on(getWorkflowProgress.name, getWorkflowProgress_)
        .on(createUpdateWorkflow.name, createUpdateWorkflow_)
        .on(copyWorkflow.name, copyWorkflow_)
        .on(activateWorkflowTemplate.name, activateWorkflowTemplate_)
        .on(deactivateWorkflowTemplate.name, deactivateWorkflowTemplate_)
}

async function getWorkflow_({ workflowId }: CoreRequest): Promise<PMResponse> {
    const workflows = await selectWorkflows({
        condition: ["_id", workflowId],
    })
    if (workflows.length) {
        return {
            workflow: workflows[0],
            status: 200,
        }
    }
    return {
        status: 404,
        message: "Workflow not found",
    }
}

async function copyWorkflow_({ workflowId }: CoreRequest): Promise<Workflow> {
    const workflows = await selectWorkflows({
        condition: ["_id", workflowId],
    })

    const workflowToCopy = workflows[0]

    const allWorkflows = await selectWorkflows({
        columns: ["name"],
    })

    let newName = `${workflowToCopy.name} (Kopie)`
    let iterator = 1

    while (allWorkflows.find(workflow => workflow.name === newName)) {
        newName = `${workflowToCopy.name} (Kopie-${iterator})`
        iterator++
    }

    const workflowCopy = copyWorkflowLocal(workflowToCopy, newName)
    await insertWorkflows(workflowCopy)
    await core.events.request(deactivateWorkflowTemplate(workflowCopy._id))
    return workflowCopy
}

async function createUpdateWorkflow_({ workflow }: CoreRequest): Promise<PMResponse> {
    if (workflow._id) {
        await updateWorkflow(workflow, ["_id", workflow._id]).catch(() => {
            return {
                status: 500,
                message: "Error while updating the database.",
            }
        })
        return {
            workflow,
            status: 200,
        }
    }
    const workflows: Workflow[] = await selectWorkflows({
        columns: ["_id"],
    })

    workflow._id = uuidv4()
    workflow.index = workflows.length

    await insertWorkflows(workflow).catch(() => {
        return {
            status: 500,
            message: "Error while inserting into database.",
        }
    })
    await core.events.request(deactivateWorkflowTemplate(workflow._id))
    return {
        workflow,
        status: 201,
    }
}

function copyWorkflowLocal(workflowTemplate: Workflow, newName?: string, newId?: string) {
    const idMap: Record<string, string> = {}

    const newSteps: Step[] = workflowTemplate.steps.map((stepTemplate: Step) => {
        const step: Step = Object.assign({}, stepTemplate)
        step._id = uuidv4()
        idMap[stepTemplate._id] = step._id
        return step
    })

    const newConnections: Record<string, string[]> = {}
    for (const [sourceId, destinationIds] of Object.entries(workflowTemplate.connections)) {
        newConnections[idMap[sourceId]] = destinationIds.map(
            (destinationId: string): string => idMap[destinationId]
        )
    }

    return {
        _id: newId || uuidv4(),
        index: workflowIndexCounter++,
        name: newName || workflowTemplate.name,
        description: workflowTemplate.description,
        steps: newSteps,
        connections: newConnections,
        startstep: idMap[workflowTemplate.startstep],
        history: workflowTemplate.history.map(({ stepId, completedat }) => {
            return {
                stepId: idMap[stepId],
                completedat: completedat,
            }
        }),
        owner: workflowTemplate.owner,
        state: workflowTemplate.state,
        majorsteps: workflowTemplate.majorsteps.map((stepId: string) => {
            return idMap[stepId]
        }),
    }
}

function isWorkflowActive(workflow: Workflow): boolean {
    return workflow.state === ProcessState.NotStarted || workflow.state === ProcessState.Pending
}

async function registerAction_({ trigger, user, workflowIds }: CoreRequest): Promise<CoreResponse> {
    let workflows: Workflow[] = []
    if (workflowIds) {
        workflows = await Promise.all(
            workflowIds.map(async (workflowId: string) => {
                return (await core.events.request(getWorkflow(workflowId))).workflow
            })
        )

        // remove workflows that could not be found
        workflows = workflows.filter((workflow: Workflow | undefined) => workflow)
    }

    if (!workflows.length) {
        workflows = await core.events.request(getWorkflowTemplates())
    }

    return Promise.all(
        workflows.filter(isWorkflowActive).map(async workflow => {
            // The filters may allow only one step to be returned
            let activeStep: Step | undefined = workflow.steps
                .filter(
                    (step: Step) =>
                        step.responsible === null ||
                        step.responsible === undefined ||
                        (user && step.responsible === user.id)
                )
                .filter((step: Step) => step.trigger === trigger)
                .filter((step: Step) => step.state === ProcessState.Pending)[0]

            if (activeStep) {
                if (workflow.history.length === 0) {
                    const newWorkflow = copyWorkflowLocal(workflow, undefined, workflowIds[0])
                    await insertWorkflows(newWorkflow)
                    workflow = newWorkflow
                    workflow.state = ProcessState.Pending
                    activeStep = workflow.steps.filter(step => step._id === workflow.startstep)[0]
                }

                await advanceWorkflow(workflow, activeStep._id)

                return workflow._id
            }
            return ""
        })
    ).then((result: string[]) => {
        return result.filter((workflowId: string) => !!workflowId)
    })
}

async function advanceWorkflow(workflow: Workflow, stepId: string) {
    workflow.state = ProcessState.Pending

    const pendingSteps: Step[] = workflow.steps.filter(
        (step: Step) => step.state === ProcessState.Pending
    )

    pendingSteps.forEach((step: Step) => (step.state = ProcessState.Skipped))

    const currentStep = pendingSteps.filter((step: Step) => step._id === stepId)[0]

    let decision
    if (currentStep) {
        if (currentStep.type === StepType.Automatic) {
            if (currentStep.delay && currentStep.delay.value > 0) {
                await launchDelayedAction(workflow, currentStep)
                return
            }

            const result = await AutomaticSteps[currentStep.trigger](
                workflow._id,
                currentStep.data || {}
            )

            if (result.decision !== undefined) {
                decision = result.decision
            }
        }

        currentStep.state = ProcessState.Completed
        workflow.history.push({
            stepId: stepId,
            completedat: Date.now(),
        })
    }
    await triggerNextAction(workflow, stepId, decision)
}

async function launchDelayedAction(workflow: Workflow, currentStep: Step) {
    currentStep.state = ProcessState.Processing
    const deadline = calculateDeadline(currentStep.delay!)

    workflow.history.push({
        stepId: currentStep._id,
        completedat: deadline,
    })

    await updateWorkflow(
        {
            state: workflow.state,
            steps: workflow.steps,
            history: workflow.history,
        },
        ["_id", workflow._id]
    )

    await createJob({
        _id: uuidv4(),
        name: `Verzögert-${currentStep.trigger}`,
        deadline: deadline,
        workflowId: workflow._id,
        autoaction: "runDelayedAction",
        stepData: {
            ...currentStep.data,
            stepId: currentStep._id,
        },
        state: ProcessState.Pending,
    })
}

function calculateDeadline(delay: { value: number; unit: TimeUnit }): number {
    let factor = 1

    switch (delay.unit) {
        case TimeUnit.Minutes:
            factor = 60000
            break
        case TimeUnit.Hours:
            factor = 60000 * 60
            break
        case TimeUnit.Days:
            factor = 60000 * 60 * 24
            break
        case TimeUnit.Weeks:
            factor = 60000 * 60 * 24 * 7
            break
        case TimeUnit.Months:
            factor = 60000 * 60 * 24 * 30
            break
        case TimeUnit.Years:
            factor = 60000 * 60 * 24 * 365
            break
    }

    return new Date().getTime() + delay.value * factor
}

export async function triggerNextAction(
    workflow: Workflow,
    stepId: string,
    decision: number | undefined
) {
    let nextStepIds: string[] | undefined = workflow.connections[stepId]
    let nextAutomaticStep: Step | undefined = undefined

    if (!nextStepIds) {
        workflow.state = ProcessState.Completed
    } else {
        let emailSent = false

        if (decision !== undefined) {
            nextStepIds = [nextStepIds[decision]]
        }

        for (let i = 0; i < nextStepIds.length; i++) {
            const nextStepId = nextStepIds[i]
            const nextStep: Step | undefined = workflow.steps.find(
                (workflowStep: Step) => workflowStep._id === nextStepId
            )
            if (nextStep) {
                nextStep.state = ProcessState.Pending
                if (nextStep.type === StepType.Manual) {
                    if (!emailSent && nextStep.responsible) {
                        sendEmail(nextStep.responsible, workflow.name)
                        emailSent = true
                    }
                } else {
                    nextAutomaticStep = nextStep
                }
            }
        }
    }

    await updateWorkflow(
        {
            state: workflow.state,
            steps: workflow.steps,
            history: workflow.history,
        },
        ["_id", workflow._id]
    )

    if (nextAutomaticStep) {
        core.events.request(registerAction(nextAutomaticStep.trigger, undefined, [workflow._id]))
    }
}

async function sendEmail(responsible: number, workflowName: string) {
    // TODO: Implement user with data coming from role
    const user = {
        firstname: "Max",
        lastname: "Mustermann",
        email: "max.mustermann@uni-heidelberg.de",
    }

    const emailSubject = `[NO REPLY] Prozess: ${workflowName} wartet auf Ihr Mitwirken`

    const emailContent = `Sehr geehrte(r) ${user.firstname} ${user.lastname},

  Prozess: ${workflowName} benötigt Ihr Mitwirken.
  Bitte schauen Sie in Ihrem Dashboard der Dekanats-App nach um den Prozess voran zu bringen.
  
  https://dekanats-app.uni-heidelberg.de/dashboard
  
  Mit freundlichen Grüßen,
  Dekanats-App
  
  Diese E-Mail wurde automatisch erstellt.
  Bitte antworten Sie nicht auf diese E-Mail.`

    const mailOptions: MailOptions = {
        to: user.email,
        subject: emailContent,
        text: emailSubject,
    }

    await core.events.request(sendMail(mailOptions))
}

async function getActiveWorkflows_(): Promise<CoreResponse> {
    const workflows: Workflow[] = await selectWorkflows()
    return workflows.filter((workflow: Workflow) => workflow.history.length)
}

async function getWorkflowTemplates_(): Promise<CoreResponse> {
    const workflows: Workflow[] = await selectWorkflows()
    return workflows.filter((workflow: Workflow) => !workflow.history.length)
}

async function getAutomaticStepTemplates_(): Promise<CoreResponse> {
    const automaticSteps: AutomaticStepTemplate[] = await selectAutomaticStepTemplates()
    return automaticSteps
}

async function getWorkflowProgress_({
    workflowId,
}: CoreRequest): Promise<{ name: string; state: ProcessState }[]> {
    const workflow: Workflow | undefined = (
        await selectWorkflows({
            condition: ["_id", workflowId],
            columns: ["steps", "majorsteps"],
        })
    )[0]

    if (!workflow) {
        return []
    }

    return workflow.majorsteps.map((stepId: string) => {
        const workflowStep: Step | undefined = workflow.steps.find((step: Step) => {
            return step._id === stepId
        })

        if (!workflowStep) {
            return {
                name: "",
                state: ProcessState.NotStarted,
            }
        }

        return {
            name: workflowStep!.name,
            state: workflowStep!.state,
        }
    })
}

async function activateWorkflowTemplate_({ workflowId }: CoreRequest): Promise<PMResponse> {
    const workflow: Workflow | undefined = (
        await selectWorkflows({
            condition: ["_id", workflowId],
        })
    )[0]

    if (!workflow) {
        return {
            status: 404,
            message: "Workflow not found",
        }
    }

    const startStep = workflow.steps.find(step => step._id === workflow.startstep)!

    if (!startStep) {
        return {
            status: 404,
            message: "Start step not found",
        }
    }

    workflow.state = ProcessState.Pending
    startStep.state = ProcessState.Pending

    await updateWorkflow(
        {
            state: workflow.state,
            steps: workflow.steps,
        },
        ["_id", workflow._id]
    )

    return {
        workflow: workflow,
        status: 200,
    }
}

async function deactivateWorkflowTemplate_({ workflowId }: CoreRequest): Promise<PMResponse> {
    const workflow: Workflow | undefined = (
        await selectWorkflows({
            condition: ["_id", workflowId],
        })
    )[0]

    if (!workflow) {
        return {
            status: 404,
            message: "Workflow not found",
        }
    }

    const startStep = workflow.steps.find(step => step._id === workflow.startstep)!

    if (!startStep) {
        return {
            status: 404,
            message: "Start step not found",
        }
    }

    workflow.state = ProcessState.NotStarted
    startStep.state = ProcessState.NotStarted

    await updateWorkflow(
        {
            state: workflow.state,
            steps: workflow.steps,
        },
        ["_id", workflow._id]
    )

    return {
        workflow: workflow,
        status: 200,
    }
}
