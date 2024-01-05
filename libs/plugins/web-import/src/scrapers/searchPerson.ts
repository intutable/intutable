import axios from "axios"
import cheerio from "cheerio"

import { PersonHandle } from "./resources"

import {
    lsf_search_link,
    lsf_person_link,
    get_list_parent,
    get_list_pid,
    get_error,
} from "./LSF_configs"

/** Creates an url for searching persons by name/surname. */
const createSearchURL = (name: string, surname: string): string => {
    let lsf_search = lsf_search_link
    if (name !== "") lsf_search += "&personal.vorname=" + name
    if (surname !== "") lsf_search += "&personal.nachname=" + surname
    return lsf_search
}

/**
 * Searches for persons in LSF having a name and surname.
 */
export const searchPerson = async (name = "", surname = ""): Promise<PersonHandle[]> => {
    if (name.length <= 0 && surname.length <= 0) {
        return []
    }

    // load data
    const searchURL = createSearchURL(name, surname)
    const response = await axios.get(searchURL)
    const html = response.data
    const $ = cheerio.load(html)

    // get names
    const persons: string[] = get_list_parent($, "Name")
        .replace(/\t/g, "")
        .replace(/\n+/g, "//")
        .split(/[/]*Name:[/]*/)
    // remove the first element because ?
    persons.shift()

    // handle exceptions
    if (persons.length === 0) {
        const error_text_1 = get_error($, "Ihre Anfrage lieferte mehr als 100 Ergebnisse")
        const error_text_2 = get_error($, "Keine Daten gefunden")

        if (error_text_1 !== "") {
            throw new Error("Too many results")
            return []
        } else if (error_text_2 !== "") {
            // TODO: not sure why this should be an error
            throw new Error("No results")

            return []
        } else {
            throw new Error("Something went wrong")
            return []
        }
    }

    // get pid
    const pid = get_list_pid($)

    // put persons into list
    const persons_array: PersonHandle[] = []
    persons.forEach((person, index) => {
        // create and add person_Handle
        const entry = pid[index].toString()
        const id = Number(entry.substring(entry.indexOf("pid=") + 4))
        let title, firstname, lastname, name_additions

        // no title vs title
        const fullname = person.split(/\/[/]*/)

        switch (fullname.length) {
            case 1:
                title = ""
                name_additions = ""
                firstname = fullname[0]
                lastname = fullname[0]
                break
            case 2:
                title = ""
                name_additions = ""
                firstname = fullname[0]
                lastname = fullname[1]
                break
            case 3:
                title = fullname[0]
                name_additions = ""
                firstname = fullname[1]
                lastname = fullname[2]
                break
            case 4:
                title = fullname[0]
                name_additions = fullname[1]
                firstname = fullname[2]
                lastname = fullname[3]
                break
            default:
                // TODO: throw an error instead?
                title = ""
                name_additions = ""
                firstname = ""
                lastname = ""
                break
        }

        persons_array.push({
            titel: title,
            namenszusatz: name_additions,
            vorname: firstname,
            name: lastname,
            pid: id,
        })
    })

    // TODO: remove duplicates

    return persons_array
}
