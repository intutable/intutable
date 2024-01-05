import { PluginLoader } from "@intutable-org/core"
import { initAutomaticSteps } from "./workflow/AutomaticSteps"
import { initWorkflowManipulation } from "./workflow/WorkflowStateManipulation"
import { initWorkflowManager } from "./workflow/WorkflowManager"
import { initDatabase } from "./data/Database"
import { initInternalTableAccess } from "./data/InternalTableAccess"
import { initJobScheduler } from "./jobs/JobScheduler"
import { initNotifications } from "./workflow/Notifications"

let core: PluginLoader

export async function init(core_: PluginLoader) {
    core = core_
    initInternalTableAccess(core)
    initAutomaticSteps(core)
    initWorkflowManager(core)
    initWorkflowManipulation(core)
    initNotifications(core)
    await initDatabase(core)
    await initJobScheduler()
}
