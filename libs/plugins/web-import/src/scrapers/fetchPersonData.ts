import axios from "axios"
import cheerio from "cheerio"
import {LehrkoerperListe, PersonalFunktion, PersonData} from "./resources"
import { get_table_entry, get_table_selector, createPersonDataURL } from "./LSF_configs"
import { PIDNotFound } from "../utils/error"

/**
 * Fetches the data of an arbitrary person from the LSF.
 */
export const fetchPersonData = async (pid: number): Promise<PersonData> => {
    const url = createPersonDataURL(pid)

    // load data
    const response = await axios.get(url)
    const html = response.data
    const $ = cheerio.load(html)

    // catch 'PID not found'
    const surname = get_table_entry($, "Nachname")
    if (surname === "") throw new PIDNotFound(pid)

    // format data from tables (Personalfunktionen, Einrichtung)
    const personalfunktionen: PersonalFunktion[] = []
    const personalfunktionData =  $(get_table_selector("Personalfunktionen"))
    let internalCounter = 0
    for(let i = 0; i < personalfunktionData.length; i += 4) {
        const einrichtung = $(personalfunktionData[i + 1]).text().trim()
        const stellung = $(personalfunktionData[i + 2]).text().trim()
        const zusatzinfo = $(personalfunktionData[i + 3]).text().trim()

        if(einrichtung === "" && stellung !== "") {
            personalfunktionen[internalCounter - 1].zusatzinfo = cleanDate(stellung)
            i -= 1
        } else {
            personalfunktionen.push({
                einrichtung: einrichtung,
                stellung: stellung,
                zusatzinfo: zusatzinfo
            })
            internalCounter++
        }
    }

    const lehrkoerperliste: LehrkoerperListe[] = []
    const lehrkoerperTable =  $(get_table_selector("Lehrkörperliste"))
    for(let i = 2; i < lehrkoerperTable.length; i += 2) {
        lehrkoerperliste.push({
            einrichtung: $(lehrkoerperTable[i]).text().trim(),
            funktion: $(lehrkoerperTable[i + 1]).text().trim()
        })
    }

    return {
        pid: pid,
        name: surname,
        vorname: get_table_entry($, "Vorname"),
        namenszusatz: get_table_entry($, "Namenszusatz"),
        titel: get_table_entry($, "Titel"),
        kennzeichen: get_table_entry($, "Kennzeichen"),
        akad_grad: get_table_entry($, "Akad. Grad"),
        berufsbezeichnung: get_table_entry($, "Berufsbezeichnung"),
        personalstatus: cleanPersonalstatus(get_table_entry($, "Personalstatus")),
        status: get_table_entry($, "Status"),
        sprechzeit: get_table_entry($, "Sprechzeit"),
        bemerkung: get_table_entry($, "Bemerkung"),
        lehrgebiete: get_table_entry($, "Lehrgebiet"),
        dienstzimmer: get_table_entry($, "Dienstzimmer"),
        gebauede: get_table_entry($, "Gebäude"),
        strasse: get_table_entry($, "Straße"),
        plz: get_table_entry($, "PLZ"),
        ort: get_table_entry($, "Ort"),
        telefon: get_table_entry($, "Telefon"),
        fax: get_table_entry($, "Fax"),
        mail: get_table_entry($, "E-Mail-Adresse"),
        link: get_table_entry($, "Hyperlink"),
        lehrkoerperliste,
        personalfunktionen,
    }
}

function cleanPersonalstatus(rawData: string): string {
    return rawData.replace(/\n\s+\[.+\]/, "")
}

function cleanDate(rawData: string): string {
    return rawData.replace(/\n\s+/, "")
}