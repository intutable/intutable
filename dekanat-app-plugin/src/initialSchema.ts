import { CoreRequest, CoreResponse, PluginLoader } from "@intutable/core"
import { CHANNEL, createStandardColumn, createTable, StandardColumnSpecifier } from "./requests"
import { createProject, getProjects } from "@intutable/project-management/dist/requests"
import { ProjectDescriptor, TableDescriptor } from "@intutable/project-management/dist/types"

const ROLE_ID = 0
let projectId = 0
let core: PluginLoader

export function initSchemaSetup(_core: PluginLoader) {
    core = _core

    core.listenForRequests(CHANNEL).on(createInitialSchemaSetup.name, createInitialSchemaSetup)
}

export function schemaSetup(connectionId: string) {
    return {
        channel: CHANNEL,
        method: "createInitialSchemaSetup",
        connectionId,
    }
}

async function createInitialSchemaSetup(request: CoreRequest): Promise<CoreResponse> {
    const connectionId = request.connectionId
    // Create project
    await core.events.request(createProject(connectionId, ROLE_ID, "Personenverwaltung"))
    console.log("Project created: Personenverwaltung")

    // Get project ID
    const allProjects = (await core.events.request(
        getProjects(request.connectionId, request.unusedRoleId)
    )) as ProjectDescriptor[]
    projectId = allProjects.find(e => e.name == "Personenverwaltung").id

    await createTablePersonen(connectionId)
    console.log("Table created: Personen")

    // TODO check permissions for projects

    //

    return {}
}

async function createTablePersonen(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Personen")
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("UniID", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Nachname", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Vorname", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Akademischer Grad", "select")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Primary Mail", "email")
        )
    )
}

function createStandardColumnSpecifier(name, type) {
    const c: StandardColumnSpecifier = {
        attributes: {
            cellTypeParameter: null,
            editable: true,
            frozen: false,
            hidden: false,
            resizable: true,
            sortable: true,
            sortDescendingFirst: false,
        },
        cellType: type,
        name: name,
    }
    return c
}