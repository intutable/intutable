import { CoreRequest, CoreResponse, PluginLoader } from "@intutable-org/core"
import {
    CHANNEL,
    createLinkColumn,
    createStandardColumn,
    createTable,
    LinkColumnSpecifier,
    StandardColumnSpecifier,
    createRow,
} from "./requests"
import { createProject, getProjects } from "@intutable-org/project-management/dist/requests"
import { ProjectDescriptor, TableDescriptor } from "@intutable-org/project-management/dist/types"
import { fetchFacultyLSF } from "@intutable-org/web-import/dist/requests"
import { PersonData } from "@intutable-org/web-import/dist/scrapers/resources"
import { insert, openConnection } from "@intutable-org/database/dist/requests"

const ROLE_ID = 0
let projectId = 0
let core: PluginLoader

// @ts-ignore
let personenTableId
// @ts-ignore
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
    // @ts-ignore
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

    insertLSFData(connectionId)

    return {}
}

// @ts-ignore
async function createTablePersonen(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Personen", "Nachname")
    )
    personenTableId = table.id
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
            createStandardColumnSpecifier("Uni ID", "string")
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

// @ts-ignore
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
        createStandardColumn(connectionId, table.id, createStandardColumnSpecifier("PLZ", "number"))
    )
    await core.events.request(
        createStandardColumn(connectionId, table.id, createStandardColumnSpecifier("Ort", "string"))
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

// @ts-ignore
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
        // @ts-ignore
        createLinkColumn(connectionId, table.id, createLinkColumnSpecifier(adressenTableId))
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

// @ts-ignore
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
        // @ts-ignore
        createLinkColumn(connectionId, table.id, createLinkColumnSpecifier(adressenTableId))
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

// @ts-ignore
async function createTableKontaktdaten(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Kontaktdaten", "Uni ID")
    )
    kontaktdatenTableId = table.id
    await core.events.request(
        // @ts-ignore
        createLinkColumn(connectionId, table.id, createLinkColumnSpecifier(personenTableId))
    )
    await core.events.request(
        createStandardColumn(connectionId, table.id, createStandardColumnSpecifier("Mail", "email"))
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Telefonnummer", "string")
        )
    )
    await core.events.request(
        // @ts-ignore
        createLinkColumn(connectionId, table.id, createLinkColumnSpecifier(adressenTableId))
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

// @ts-ignore
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

// @ts-ignore
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

// @ts-ignore
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

// @ts-ignore
async function createTableLehruebertragung(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Lehrübertragung", "Fach")
    )
    lehruebertragungTableId = table.id
    await core.events.request(
        createStandardColumn(connectionId, table.id, createStandardColumnSpecifier("Art", "string"))
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

// @ts-ignore
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

// @ts-ignore
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
        // @ts-ignore
        createLinkColumn(connectionId, table.id, createLinkColumnSpecifier(adressenTableId))
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

// @ts-ignore
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

// @ts-ignore
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
        // @ts-ignore
        createLinkColumn(connectionId, table.id, createLinkColumnSpecifier(adressenTableId))
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

// @ts-ignore
async function createTableTemporaereGremien(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Temporäre Gremien", "Bezeichnung")
    )
    temporaereGremienTableId = table.id
    await core.events.request(
        createStandardColumn(connectionId, table.id, createStandardColumnSpecifier("Von", "date"))
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

// @ts-ignore
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

// @ts-ignore
async function createTableAbwesenheiten(connectionId) {
    const table: TableDescriptor = await core.events.request(
        createTable(connectionId, ROLE_ID, projectId, "Abwesenheiten", "Kürzel")
    )
    abwesenheitenTableId = table.id
    await core.events.request(
        createStandardColumn(connectionId, table.id, createStandardColumnSpecifier("Art", "string"))
    )
    await core.events.request(
        createStandardColumn(
            connectionId,
            table.id,
            createStandardColumnSpecifier("Kommentar", "string")
        )
    )
}

// @ts-ignore
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

// @ts-ignore
function createLinkColumnSpecifier(foreignTableId) {
    const c: LinkColumnSpecifier = {
        foreignTable: foreignTableId,
    }
    return c
}

// @ts-ignore
async function insertLSFData(connectionId) {
    /*
    @example ```
insert("tableName", { first_name: "Max", last_name: "Muster", age: 42 })
```
        ```
insert("tableName", [{ first_name: "Max", last_name: "Messer", age: 42 },
                    { first_name: "Maria", last_name: "Gabel", age: 23 },
                    { first_name: "Markus", last_name: "Löffel", age: 23 }
])
```
*/
    console.log("Start fetching LSF data ...")
    const persons: PersonData[] = await core.events.request(fetchFacultyLSF(110000))
    console.log("Finished fetching LSF data")

    const connId = await core.events
        .request(openConnection("admin", "admin"))
        .then(({ connectionId }) => connectionId)

    let i = 0
    let personenCounter = 1

    // First the adresses
    const adresses: Adresse[] = cleanAdressen(persons)

    for (const adress of adresses) {
        await core.events.request(
            insert(connId, "p1_adressen", {
                index: i,
                name: adress.strasse,
                hausnummer: adress.hausnummer,
                plz: adress.plz,
                ort: adress.ort,
            })
        )
    }

    for (const person of persons) {
        if (person.name === "N.N.") {
            continue
        }
        console.log("Inserting person " + personenCounter + " of " + persons.length + 1)
        await core.events.request(
            insert(connId, "p1_personen", {
                index: i,
                name: person.name,
                vorname: person.vorname,
                akademischer_grad: person.titel,
                primary_mail: person.mail,
            })
        )

        let hausnummer = 0
        let strasse = ""

        if (person.strasse !== "") {
            // @ts-ignore
            hausnummer = parseInt(person.strasse.match(/\d+/)[0])
            // @ts-ignore
            strasse = person.strasse.match(/\D+/)[0]
            // @ts-ignore
            const adressId = adresses.find(
                e => e.strasse === strasse && e.hausnummer === hausnummer
            ).id

            await core.events.request(
                insert(connId, "p1_kontaktdaten", {
                    index: i,
                    "j#1_fk": personenCounter,
                    mail: person.mail,
                    telefonnummer: person.telefon,
                    "j#6_fk": adressId,
                    raumnummer: person.dienstzimmer,
                })
            )
        } else {
            await core.events.request(
                insert(connId, "p1_kontaktdaten", {
                    index: i,
                    "j#1_fk": personenCounter,
                    mail: person.mail,
                    telefonnummer: person.telefon,
                    raumnummer: person.dienstzimmer,
                })
            )
        }

        personenCounter++
        i++
    }
}

function cleanAdressen(persons: PersonData[]) {
    const adresses: Adresse[] = []
    let adressenCounter = 2

    // @ts-ignore
    const firstHausnummer = persons[0].strasse.match(/\d+/)[0]
    // @ts-ignore
    const firstStrasse = persons[0].strasse.match(/\D+/)[0]
    adresses.push({
        id: 1,
        strasse: firstStrasse,
        hausnummer: parseInt(firstHausnummer),
        ort: persons[0].ort,
        plz: parseInt(persons[0].plz.trim()),
    })

    for (const person of persons) {
        if (person.strasse === "") {
            continue
        }
        // @ts-ignore
        const hausnummer = parseInt(person.strasse.match(/\d+/)[0])
        // @ts-ignore
        const strasse = person.strasse.match(/\D+/)[0]

        const alreadyExists = adresses.some(
            e => e.strasse === strasse && e.hausnummer === hausnummer
        )

        if (!alreadyExists) {
            adresses.push({
                id: adressenCounter,
                strasse: strasse,
                hausnummer: hausnummer,
                ort: person.ort,
                plz: parseInt(person.plz.trim()),
            })
            adressenCounter++
        }
    }

    return adresses
}

interface Adresse {
    id: number
    strasse: string
    hausnummer: number
    plz: number
    ort: string
}