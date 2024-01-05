import axios from "axios"
import cheerio from "cheerio"
import {PersonData, PersonHandle} from "./resources"
import { createFacultyURL, get_table_selector_link } from "./LSF_configs"
import { FacultyNotFound } from "../utils/error"
import {fetchPersonData} from "./fetchPersonData";

/**
 * Fetches all persons within a certain faculty.
 */

export const fetchPersonsInFaculty = async (facultyId: number): Promise<PersonHandle[]> => {
    // load data
    const link = createFacultyURL(facultyId)
    const response = await axios.get(link)
    const html = response.data
    const $ = cheerio.load(html)

    const persons: PersonHandle[] = []

    // get pids from tables
    const tables = ["Personalfunktionen", "Lehrkörperliste", "LSF-Beauftragte"] as const
    tables.forEach(table => {
        const pidLinks = $(get_table_selector_link(table))
            .map((_, element) => $(element).attr("href"))
            .toArray()

        const personsLinkText = $(get_table_selector_link(table))
            .map((_, element) => $(element).text())
            .toArray()

        pidLinks.forEach((pidLink, index) => {
            const entry = pidLink.toString()
            const text = personsLinkText[index].toString()
            const pid = entry.substring(entry.indexOf("pid=") + 4)
            const [name, vorname, titel] = text.split(",")


            persons.push({
                pid: Number(pid),
                name: name.trim(),
                vorname: vorname.trim(),
                titel: ((titel) ? titel.trim() : ''),
                namenszusatz: "", // TODO: ?
            })

        })
    })

    // remove duplicates
    // BUG: https://gitlab.com/intutable/dekanat-app/-/merge_requests/155#note_1389866757
    const persons_unique: PersonHandle[] = []

    persons.forEach(person => {
        if(!persons_unique.some(unique_person => unique_person.pid === person.pid)) {
            if(person.name !== "N.") {
                persons_unique.push(person)
            }
        }
    })

    const full_person_data: PersonData[] = []

    for(const person of persons_unique){
        const r = await fetchPersonData(person.pid)
        full_person_data.push(r)
    }

    return full_person_data
}
