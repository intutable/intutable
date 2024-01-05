import { FacultyNotFound } from "../utils/error"
import { faculties } from "./resources"

export const lsf_search_link =
    "https://lsf.uni-heidelberg.de/qisserver/rds?state=wsearchv&search=7&purge=y&moduleParameter=person/person"

export const lsf_person_link =
    "https://lsf.uni-heidelberg.de/qisserver/rds?state=verpublish&status=init&vmfile=no&moduleCall=webInfo&publishConfFile=webInfoPerson&publishSubDir=personal&keep=y&purge=y&personal.pid="

/** Creates a url to the LSF page of a person. */
export const createPersonDataURL = (pid: number): string => lsf_person_link + pid

/** Creates a url to a certain faculty. */
export const createFacultyURL = (facultyId: number): string => {
    if (!Array.from(faculties.values()).includes(facultyId)) throw new FacultyNotFound(facultyId)

    return (
        "https://lsf.uni-heidelberg.de/qisserver/rds?state=verpublish&status=init&vmfile=no&moduleCall=webInfo&publishConfFile=webInfoEinrichtung&publishSubDir=einrichtung&keep=y&einrichtung.eid=" +
        facultyId
    )
}

export function get_list_parent($: cheerio.Root, entry: string): string {
    return $(".erg_list_entry div:contains(" + entry + ")")
        .parent()
        .text()
        .trim()
}

export function get_table_entry($: cheerio.Root, entry: string): string {
    return (
        $("th:contains(" + entry + ")")
            .next()
            .text()
            .trim() +
        $("td:contains(" + entry + ")")
            .next()
            .text()
            .trim()
    )
}

/**
 * Returns a html selector for a table with the given name.
 * Links to the data cells.
 */
export function get_table_selector(table: string): string {
    return "table:contains(" + table + ") > tbody > tr > td"
}

export function get_table_selector_link(table: string): string {
    return "table:contains(" + table + ") > tbody > tr > td > a"
}

export function get_list_pid($: cheerio.Root): cheerio.Element[] {
    return $(".erg_list_entry div:contains(Name)")
        .nextAll("a")
        .map((i, x) => $(x).attr("href"))
        .toArray()
}

export function get_error($: cheerio.Root, error_text: string): string {
    return $("div:contains(" + error_text + ")")
        .text()
        .trim()
}
