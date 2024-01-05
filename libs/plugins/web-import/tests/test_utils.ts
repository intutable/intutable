import { Core } from "@intutable-org/core"
import { listPersonsLSF } from "../src/requests"
import { PersonHandle } from "../src/scrapers/resources"

export async function listAndValidatePersonsFromLSF(core: Core, name = "", surname = "") {
    const response = await core.events.request(listPersonsLSF(name, surname))
    expect(response.length).toBeGreaterThan(0)
    response.forEach((person: PersonHandle) => {
        expect(person.vorname.toLowerCase()).toContain(name.toLowerCase())
        expect(person.name.toLowerCase()).toContain(surname.toLowerCase())
    })
}

export async function listPersonsLSFWithError(
    core: Core,
    name = "",
    surname = "",
    errormessage = ""
) {
    const response = await core.events.request(listPersonsLSF(name, surname))
    expect(response.error).toBeDefined()
    if (errormessage !== "") {
        expect(response.error).toEqual(errormessage)
    }
}
