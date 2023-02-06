/**
 * Specifications of example data.
 */
import { TableDescriptor, ForwardLinkDescriptor } from "shared/dist/types"
import { StandardColumnSpecifier } from "dekanat-app-plugin/dist/types/requests"

export const PK_COLUMN = "_id"
export const DEFAULT_COLUMNS = ["Name"]

export type TableSpec = {
    name: string
    /** Make sure these do not have the same name as any table. */
    columns: StandardColumnSpecifier[]
    /**
     * Can only specify tables that have already been created.
     * NOTE: we want to be able to specify, without knowing the IDs, the mappings of rows.
     * To do this, we use rows' user-primary keys. This means that, for the purposes of these
     * demo data, they have to be unique, even though the app itself does not require this!
     */
    links: Table[]
}
export type Table = {
    spec: TableSpec
    descriptor: TableDescriptor
    /**
     * In order to insert data, we need a column's ID. Instead of fetching this from the DB
     * each time, we will just create a mapping of column names -> column IDs when creating a table.
     */
    columnMappings: Record<string, number>
    linkMappings: Record<string, ForwardLinkDescriptor>
    /**
     * Maps the value of a row's user-primary key to its ID. So the value has to be unique, if we
     * want to be able to find it for linking.
     */
    rowMappings: Record<string, number>
}
export type TableExampleData = {
    /**
     * I had to add a way to hook up links as well (more complex: you can't just specify an inline
     * value, you have to get the right ID, which requires a lookup in the foreign table's
     * `rowMappings`. I didn't feel like re-writing all these row objects, so I kept their
     * structure as simple objects, and wherever I need to hook up a link, I treat the key
     * as a table name. The way the code distinguishes is "is this name present in the table's
     * column mappings? Well, then try the link mappings!". When it finds a linked table, it can
     * use that table's row mappings to find the correct ID.
     */
    rows: Record<string, unknown>[]
}

export const PERSONEN_SPEC: TableSpec = {
    name: "Personen",
    columns: [
        {
            name: "Vorname",
            cellType: "string",
        },
        {
            name: "Titel",
            cellType: "string",
        },
        {
            name: "Stellung",
            cellType: "string",
        },
    ],
    links: [],
}
export const PERSONEN = {} as Table

export const PERSONEN_DATA: TableExampleData = {
    rows: [
        {
            Name: "Bayer",
            Vorname: "Walter",
            Titel: "Prof. Dr.",
            Stellung: "Professor",
        },
        {
            Name: "Ahrens",
            Vorname: "Rüdiger",
            Titel: "Prof. Dr.",
            Stellung: "Professor",
        },
        {
            Name: "van Beek",
            Vorname: "Boris",
            Titel: "Prof. Dr.",
            Stellung: "Professor",
        },
        {
            Name: "Grabosch",
            Vorname: "Heinrich",
            Titel: "Prof. Dr.",
            Stellung: "Professor",
        },
        {
            Name: "Rech",
            Vorname: "Larissa",
            Titel: "Dr.",
            Stellung: "FK-Leitung",
        },
        {
            Name: "Heussen",
            Vorname: "Hannelore",
            Titel: "Prof. Dr.",
            Stellung: "Professor",
        },
        {
            Name: "Leidermann",
            Vorname: "Fabian",
            Titel: "Prof. Dr.",
            Stellung: "Professor",
        },
        {
            Name: "Sydow",
            Vorname: "Antonia",
            Titel: "Prof. Dr.",
            Stellung: "Professor",
        },
        {
            Name: "Haeberlein",
            Vorname: "Mareike",
            Titel: "Prof. Dr.",
            Stellung: "Professor",
        },
        {
            Name: "Zaech",
            Vorname: "Sören",
            Titel: "Prof. Dr.",
            Stellung: "Professor",
        },
    ],
}

export const ORGANE_SPEC: TableSpec = {
    name: "Organe",
    columns: [
        {
            name: "Kuerzel",
            cellType: "string",
        },
        {
            name: "Typ",
            cellType: "string",
        },
        {
            name: "FK/Math/Inf",
            cellType: "select",
        },
    ],
    links: [],
}
export const ORGANE = {} as Table

export const ORGANE_DATA: TableExampleData = {
    rows: [
        {
            // 1
            Name: "StuKo Mathematik",
            Kuerzel: "SK Math",
            Typ: "Kommission",
            "FK/Math/Inf": "Math",
        },
        {
            // 2
            Name: "Dekanat",
            Kuerzel: "Dekanat",
            Typ: "Einrichtung",
            "FK/Math/Inf": "FK",
        },
        {
            // 3
            Name: "Fakultätsvorstand",
            Kuerzel: "FK-Vorstand",
            Typ: "Kommission",
            "FK/Math/Inf": "FK",
        },
        {
            // 4
            Name: "Institut für Angewandte Mathematik",
            Kuerzel: "IAM",
            Typ: "Einrichtung",
            "FK/Math/Inf": "Math",
        },
        {
            // 5
            Name: "Institut für Informatik",
            Kuerzel: "IfI",
            Typ: "Einrichtung",
            "FK/Math/Inf": "Inf",
        },
        {
            // 6
            Name: "Institut für Technische Informatik",
            Kuerzel: "ZITI",
            Typ: "Einrichtung",
            "FK/Math/Inf": "Inf",
        },
        {
            // 7
            Name: "Mathematisches Institut",
            Kuerzel: "MI",
            Typ: "Einrichtung",
            "FK/Math/Inf": "Math",
        },
        {
            // 8
            Name: "PA BA und MA Informatik",
            Kuerzel: "PA BA+MA Inf",
            Typ: "Kommission",
            "FK/Math/Inf": "Inf",
        },
        {
            // 9
            Name: "PA Informatik Promotionen",
            Kuerzel: "PA Prom Inf",
            Typ: "Kommission",
            "FK/Math/Inf": "Inf",
        },
        {
            // 10
            Name: "PA Lehramt Informatik",
            Kuerzel: "PA LA Inf",
            Typ: "Kommission",
            "FK/Math/Inf": "Inf",
        },
        {
            // 11
            Name: "PA Math Promotionen",
            Kuerzel: "PA Prom Math",
            Typ: "Kommission",
            "FK/Math/Inf": "Math",
        },
        {
            // 12
            Name: "StuKo Informatik",
            Kuerzel: "SK Inf",
            Typ: "Kommission",
            "FK/Math/Inf": "Inf",
        },
    ],
}

export const ROLLEN_SPEC = {
    name: "Rollen",
    columns: [],
    links: [PERSONEN, ORGANE],
}
export const ROLLEN = {} as Table

export const ROLLEN_DATA: TableExampleData = {
    rows: [
        {
            Name: "Vorsitz",
            Personen: "Heussen",
            Organe: "PA Lehramt Informatik",
        },
        {
            Name: "Prodekan",
            Personen: "Zaech",
            Organe: "Dekanat",
        },
        {
            Name: "Dekan",
            Personen: "Heussen",
            Organe: "Dekanat",
        },
        {
            Name: "Vorsitz",
            Personen: "van Beek",
            Organe: "PA Math Promotionen",
        },
        {
            Name: "Mitglied",
            Personen: "Zaech",
            Organe: "PA Math Promotionen",
        },
        {
            Name: "Vorsitz",
            Personen: "Leidermann",
            Organe: "StuKo Informatik",
        },
        {
            Name: "Vorsitz",
            Personen: "Ahrens",
            Organe: "PA Informatik Promotionen",
        },
        {
            Name: "Vorsitz",
            Personen: "Grabosch",
            Organe: "StuKo Mathematik",
        },
        {
            Name: "Vorsitz",
            Personen: "Zaech",
            Organe: "PA BA und MA Informatik",
        },
    ],
}
