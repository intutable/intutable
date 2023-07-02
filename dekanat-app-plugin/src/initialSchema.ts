import { CoreRequest, CoreResponse, PluginLoader } from "@intutable/core"
import {
    CHANNEL,
    createLinkColumn,
    createStandardColumn,
    createTable,
    LinkColumnSpecifier,
    StandardColumnSpecifier
} from "./requests";
import { createProject, getProjects } from "@intutable/project-management/dist/requests"
import { ProjectDescriptor, TableDescriptor } from "@intutable/project-management/dist/types"

const ROLE_ID = 0
let projectId = 0
let core: PluginLoader

let personenTableId
let adressenTableId
let interneEinrichtungenTableId
let externeEinrichtungenTableId
let kontaktdatenTableId
let statusTableId
let pruefungsrechteTableId
let pruefungsfaecherTableId
let lehruebertragungTableId
let wahlaemterTableId
let funktionenTableId
let interneGremienTableId
let externeGremienTableId
let temporaereGremienTableId
let mitgliedsartTableId
let abwesenheitenTableId

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

    await createTableAdressen(connectionId)
    console.log("Table created: Adressen")

    await createTableInterneEinrichtungen(connectionId)
    console.log("Table created: Interne Einrichtungen")

    await createTableExterneEinrichtungen(connectionId)
    console.log("Table created: Externe Einrichtungen")

    await createTableKontaktdaten(connectionId)
    console.log("Table created: Kontaktdaten")

    await createTableStatus(connectionId)
    console.log("Table created: Status")

    await createTablePruefungsrechte(connectionId)
    console.log("Table created: Prüfungsrechte")

    await createTablePruefungsfaecher(connectionId)
    console.log("Table created: Prüfungsfächer")

    await createTableLehruebertragung(connectionId)
    console.log("Table created: Lehrübertragung")

    await createTableWahlaemter(connectionId)
    console.log("Table created: Wahlämter")

    await createTableFunktionen(connectionId)
    console.log("Table created: Funktionen")

    await createTableInterneGremien(connectionId)
    console.log("Table created: Interne Gremien")

    await createTableExterneGremien(connectionId)
    console.log("Table created: Externe Gremien")

    await createTableTemporaereGremien(connectionId)
    console.log("Table created: Temporäre Gremien")

    await createTableMitgliedsart(connectionId)
    console.log("Table created: Mitgliedsart")

    await createTableAbwesenheiten(connectionId)
    console.log("Table created: Abwesenheiten")

    return {}
}

async function createTablePersonen(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Personen", "Uni ID")
    )
    personenTableId = table.id
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
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

async function createTableAdressen(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Adressen", "Straße")
    )
    adressenTableId = table.id
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Hausnummer", "number")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("PLZ", "number")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Ort", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Staat", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Adresszusatz", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

async function createTableInterneEinrichtungen(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Interne Einrichtungen", "Kürzel")
    )
    interneEinrichtungenTableId = table.id
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Einrichtungsname", "string")
        )
    )
    await core.events.request(
        createLinkColumn(
            connectionId,
            table.id,
            createLinkColumnSpecifier(adressenTableId)
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

async function createTableExterneEinrichtungen(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Externe Einrichtungen", "Kürzel")
    )
    externeEinrichtungenTableId = table.id
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Einrichtungsname", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Universität", "string")
        )
    )
    await core.events.request(
        createLinkColumn(
            connectionId,
            table.id,
            createLinkColumnSpecifier(adressenTableId)
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

async function createTableKontaktdaten(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Kontaktdaten", "Uni ID")
    )
    kontaktdatenTableId = table.id
    await core.events.request(
        createLinkColumn(
            connectionId,
            table.id,
            createLinkColumnSpecifier(personenTableId)
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Mail", "email")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Telefonnummer", "number")
        )
    )
    await core.events.request(
        createLinkColumn(
            connectionId,
            table.id,
            createLinkColumnSpecifier(adressenTableId)
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Raumnummer", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

async function createTableStatus(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Status", "Kürzel")
    )
    statusTableId = table.id
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Bezeichnung", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

async function createTablePruefungsrechte(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Prüfungsrechte", "Kürzel")
    )
    pruefungsrechteTableId = table.id
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Grad", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

async function createTablePruefungsfaecher(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Prüfungsfächer", "Kürzel")
    )
    pruefungsfaecherTableId = table.id
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Bezeichnung", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

async function createTableLehruebertragung(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Lehrübertragung", "Fach")
    )
    lehruebertragungTableId = table.id
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Art", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

async function createTableWahlaemter(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Wahlämter", "Kürzel")
    )
    wahlaemterTableId = table.id
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Volle Bezeichnung", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Funktionsmail", "email")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Wahlperiode", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

async function createTableFunktionen(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Funktionen", "Kürzel")
    )
    funktionenTableId = table.id
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Bezeichnung", "string")
        )
    )
    await core.events.request(
        createLinkColumn(
            connectionId,
            table.id,
            createLinkColumnSpecifier(adressenTableId)
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

async function createTableInterneGremien(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Interne Gremien", "Kürzel")
    )
    interneGremienTableId = table.id
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Bezeichnung", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Wahlperiode", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Funktionsadresse", "email")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

async function createTableExterneGremien(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Externe Gremien", "Kürzel")
    )
    externeGremienTableId = table.id
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Bezeichnung", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Wahlperiode", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Funktionsadresse", "email")
        )
    )
    await core.events.request(
        createLinkColumn(
            connectionId,
            table.id,
            createLinkColumnSpecifier(adressenTableId)
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

async function createTableTemporaereGremien(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Temporäre Gremien", "Bezeichnung")
    )
    temporaereGremienTableId = table.id
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Von", "date")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Bis (geplant)", "date")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Bis (tatsächlich)", "date")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

async function createTableMitgliedsart(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Mitgliedsart", "Kürzel")
    )
    mitgliedsartTableId = table.id
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Bezeichnung", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

async function createTableAbwesenheiten(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Abwesenheiten", "Kürzel")
    )
    abwesenheitenTableId = table.id
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Art", "string")
        )
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
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

function createLinkColumnSpecifier(foreignTableId) {
    const c: LinkColumnSpecifier = {
        foreignTable: foreignTableId,
    }
    return c
}