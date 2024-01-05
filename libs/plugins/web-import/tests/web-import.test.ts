import path from "path"
import { Core } from "@intutable/core"
import {
    fetchPersonLSF,
    fetchFacultyLSF,
    insertPersonDataIntoTable,
    insertTemporaryDataIntoProject,
} from "../src/requests"
import { listAndValidatePersonsFromLSF, listPersonsLSFWithError } from "./test_utils"
import { openConnection, listTables } from "@intutable/database/dist/requests"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import {
    createProject,
    getProjects,
    getTablesFromProject,
    removeProject,
    removeTable,
    getTableData,
} from "@intutable/project-management/dist/requests"
import { mustermannn_data, PersonData } from "../src/scrapers/resources"

const PLUGIN_PATHS = [
    path.join(__dirname, "../"),
    path.join(__dirname, "../node_modules/@intutable/*"),
]
let DB_CONN_ID = "1"
const USERNAME = "admin"
const PASSWORD = "admin"
const TEST_ROLE = 1
const TEST_PROJECT = 1

let core: Core

beforeAll(async () => {
    core = await Core.create(PLUGIN_PATHS)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const open = (await core.events.request(openConnection(USERNAME, PASSWORD))) as any
    DB_CONN_ID = open.connectionId
})

afterAll(async () => {
    //delete temporary tables
    const tables = await core.events.request(listTables(DB_CONN_ID))
    for (const table of tables) {
        if (table.startsWith("temporary_table")) {
            await core.events.request(removeTable(DB_CONN_ID, table))
        }
    }
    await core.plugins.closeAll()
})

// TODO: proper mocking (e.g. download parts of LSF page so that hardcoded result expectations won't break)
describe("list persons lsf", () => {
    it("should return a list of persons with surname 'mustermann'", async () => {
        await listAndValidatePersonsFromLSF(core, "", "Mustermann")
    })
    it("should return a list of persons with name 'Max'", async () => {
        await listAndValidatePersonsFromLSF(core, "Max", "")
    })
    it("should return an error if searching for a person that does not exist", async () => {
        await listPersonsLSFWithError(
            core,
            "Thispersondoesdefinitly",
            "notexistamprettysureaboutthat",
            "No results"
        )
    })
    it("should return an error if name or surname are only one character", async () => {
        //await listPersonsLSFWithError(core, "a", "", "Not enough characters")
        await listPersonsLSFWithError(core, "a", "", "Something went wrong")
        //await listPersonsLSFWithError(core, "", "a", "Not enough characters")
        await listPersonsLSFWithError(core, "", "a", "Something went wrong")
    })
    it("should return an error if too many results found", async () => {
        await listPersonsLSFWithError(core, "Peter", "", "Too many results")
    })
})

describe("fetch person lsf", () => {
    it("should return a person with id 29547 (Max Mustermann)", async () => {
        const response = await core.events.request(fetchPersonLSF(29547))
        expect(response.name).toEqual("Mustermann")
        expect(response.vorname).toEqual("Maximilian")
        expect(response.namenszusatz).toEqual("")
        expect(response.titel).toEqual("")
        expect(response.akad_grad).toEqual("")
        expect(response.kennzeichen).toEqual("Aktiv")
        expect(response.berufsbezeichnung).toEqual("")
        expect(response.personalstatus).toEqual("")
        expect(response.status).toEqual("intern")
        expect(response.sprechzeit).toEqual("")
        expect(response.bemerkung).toEqual("")
        expect(response.lehrgebiete).toEqual("")
        expect(response.dienstzimmer).toEqual("")
        expect(response.gebauede).toEqual("")
        expect(response.strasse).toEqual("")
        expect(response.plz).toEqual("")
        expect(response.ort).toEqual("")
        expect(response.telefon).toEqual("")
        expect(response.fax).toEqual("")
        expect(response.mail).toEqual("")
        expect(response.link).toEqual("")
        expect(response.lehrkoerperliste).toEqual([])
        expect(response.personalfunktionen).toEqual([])
    })
})

describe("test fetch faculty lsf", () => {
    // this test is really slow
    jest.setTimeout(100_000)
    it("test faculty import", async () => {
        await core.events.request(fetchFacultyLSF(110000))
    })
})

describe("test inserting persons into table", () => {
    it("test empty persons_list", async () => {
        const response = await core.events.request(
            insertPersonDataIntoTable(DB_CONN_ID, TEST_ROLE, [], TEST_PROJECT, 1)
        )
        expect(response.error).toBeDefined()
        expect(response.error).toEqual("no persons to insert")
    })

    // it("test existing table", async () => {
    //     const mustermann = await core.events.request(fetchPersonLSF(29547))
    //     const response = await core.events.request(
    //         insertPersonDataIntoTable(DB_CONN_ID, TEST_ROLE, [mustermann], TEST_PROJECT, 2)
    //     )
    //     expect(response.error).toBeDefined()
    //     expect(response.error).toEqual("tablename already exists")
    // })

    it("test by inserting mustermann multiple times", async () => {
        const mustermann = await core.events.request(fetchPersonLSF(29547))
        await core.events.request(
            insertPersonDataIntoTable(
                DB_CONN_ID,
                TEST_ROLE,
                [mustermann, mustermann, mustermann],
                TEST_PROJECT,
                1
            )
        )
    })
})

describe("test inserting temporary data into project", () => {
    //create test project
    const PROJECT_TEST: ProjectDescriptor = {
        id: 1,
        name: "testproject",
    }

    it("creating test setup", async () => {
        const projects = await core.events.request(getProjects(DB_CONN_ID, TEST_ROLE))

        for (const project of projects) {
            await core.events.request(removeProject(DB_CONN_ID, project.id))
        }

        PROJECT_TEST.id = (
            await core.events.request(createProject(DB_CONN_ID, TEST_ROLE, "testproject"))
        ).id
    })
})
