import { ColumnType, Column } from "@intutable-org/database/dist/types"

export type LehrkoerperListe = {
    einrichtung: string
    funktion: string
}

export type PersonalFunktion = {
    einrichtung: string
    stellung: string
    zusatzinfo: string
}

export type PersonHandle = {
    titel: string
    namenszusatz: string
    vorname: string
    name: string
    pid: number
}

export type PersonData = {
    pid: number
    name: string
    vorname: string
    namenszusatz: string
    titel: string
    akad_grad: string
    kennzeichen: string
    berufsbezeichnung: string
    personalstatus: string
    status: string
    sprechzeit: string
    bemerkung: string
    lehrgebiete: string
    dienstzimmer: string
    gebauede: string
    strasse: string
    plz: string
    ort: string
    telefon: string
    fax: string
    mail: string
    link: string
    lehrkoerperliste: LehrkoerperListe[]
    personalfunktionen: PersonalFunktion[]
}

/**
 * A list of column names and column types,
 * that should be generated for each person data.
 */
export const person_data_table_structure: Column[] = [
    {
        // BUG: other ColumnTypes than 'text' might not be supported
        // not sure if this is needed or automatically generated
        name: "index",
        type: ColumnType.integer,
    },
    {
        name: "name",
        type: ColumnType.text,
    },
    {
        name: "vorname",
        type: ColumnType.text,
    },
    {
        name: "namenszusatz",
        type: ColumnType.text,
    },
    {
        name: "titel",
        type: ColumnType.text,
    },
    {
        name: "akad_grad",
        type: ColumnType.text,
    },
    {
        name: "kennzeichen",
        type: ColumnType.text,
    },
    {
        name: "berufsbezeichnung",
        type: ColumnType.text,
    },
    {
        name: "personalstatus",
        type: ColumnType.text,
    },
    {
        name: "status",
        type: ColumnType.text,
    },
    {
        name: "sprechzeit",
        type: ColumnType.text,
    },
    {
        name: "bemerkung",
        type: ColumnType.text,
    },
    {
        name: "lehrgebiete",
        type: ColumnType.text,
    },
    {
        name: "dienstzimmer",
        type: ColumnType.text,
    },
    {
        name: "gebauede",
        type: ColumnType.text,
    },
    {
        name: "strasse",
        type: ColumnType.text,
    },
    {
        name: "plz",
        type: ColumnType.text,
    },
    {
        name: "ort",
        type: ColumnType.text,
    },
    {
        name: "telefon",
        type: ColumnType.text,
    },
    {
        name: "fax",
        type: ColumnType.text,
    },
    {
        name: "mail",
        type: ColumnType.text,
    },
    {
        name: "link",
        type: ColumnType.text,
    },
    {
        name: "lehrkoerperliste",
        type: ColumnType.text,
    },
    {
        name: "personalfunktionen",
        type: ColumnType.text,
    },
]

/**
 * A list of all faculties and their ids
 *
 * Map<[name, id]>
 */
export const faculties = new Map([
    ["Theologische Fakultät", 10000],
    ["Juristische Fakultät", 20000],
    ["Medizinische Fakultät Heidelberg", 50000],
    ["Philosophische Fakultät", 70000],
    ["Neuphilologische Fakultät ", 90000],
    ["Fakultät für Wirtschafts- und Sozialwissenschaften", 180000],
    ["Fakultät für Verhaltens- und Empirische Kulturwissenschaften", 100000],
    ["Fakultät für Mathematik und Informatik", 110000],
    ["Fakultät für Chemie und Geowissenschaften", 120000],
    ["Fakultät für Physik und Astronomie", 130000],
    ["Fakultät für Biowissenschaften", 140000],
    ["Fakultät für Ingenieurwissenschaften", 922338],
    ["Gesamtfakultät für Mathematik, Ingenieur- und Naturwissenschaften", 610000],
    ["test_faculty", -1],
])

/**
 * @deprecated
 */
export const mustermannn_data: PersonData = {
    pid: 123,
    name: "Mustermann",
    vorname: "Maximilian",
    namenszusatz: "von und zu",
    titel: "Dr",
    akad_grad: "Dr rer nat",
    kennzeichen: "Aktiv",
    berufsbezeichnung: "example",
    personalstatus: "teacher",
    status: "internal",
    sprechzeit: "every other monday",
    bemerkung: "no",
    lehrgebiete: "Testing",
    dienstzimmer: "no office",
    gebauede: "no building",
    strasse: "no street",
    plz: "69120",
    ort: "Heidelberg",
    telefon: "+49",
    fax: "no fax",
    mail: "max@mustermann",
    link: "mustermann.de",
    //lehrkoerperliste: ["Testing executive"],
    lehrkoerperliste: [],
    //personalfunktionen: ["Institute 1", "Institute 2"],
    personalfunktionen: [],
}
