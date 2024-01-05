import { AutomaticSteps } from "../workflow/AutomaticSteps"
import { Job, ProcessState } from "../types"
import { deleteJob, insertJobs, selectJobs, updateJob } from "../data/InternalTableAccess"

const timerMap = new Map()

function setupJob(job: Job): NodeJS.Timeout {
    return global.setTimeout(async () => {
        AutomaticSteps[job.autoaction](job.workflowId, job.stepData)
        timerMap.delete(job._id)
        job.state = ProcessState.Completed
        await updateJob({ state: job.state }, ["_id", job._id])
    }, Math.max(job.deadline - Date.now(), 0))
}

export async function initJobScheduler() {
    const jobs: Job[] = await selectJobs()

    for (const job of jobs) {
        if (job.state === ProcessState.Pending) {
            timerMap.set(job._id, setupJob(job))
        }
    }
}

export async function createJob(job: Job): Promise<void> {
    timerMap.set(job._id, setupJob(job))
    await insertJobs(job)
}

export async function killJobsByWorkflowIdAndName(workflowId: string, name: string): Promise<void> {
    const jobs: { _id: string; name: string }[] = await selectJobs({
        columns: ["_id", "name"],
        condition: ["workflowId", workflowId],
    })
    const jobsToDelete: { _id: string; name: string }[] = jobs.filter(
        (job: { _id: string; name: string }) => {
            return job.name === name
        }
    )

    for (const job of jobsToDelete) {
        global.clearTimeout(timerMap.get(job._id))
        timerMap.delete(job._id)
        await deleteJob(["_id", job._id])
    }
}

export async function killAllJobsOfWorkflow(workflowId: string): Promise<void> {
    const jobs: { _id: string }[] = await selectJobs({
        columns: ["_id", "name"],
        condition: ["workflowId", workflowId],
    })

    jobs.forEach((job: { _id: string }) => {
        global.clearTimeout(timerMap.get(job._id))
        timerMap.delete(job._id)
    })

    await deleteJob(["workflowId", workflowId])
}
