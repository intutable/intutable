/**
 * Specifications of example data.
 */
import {
    Column,
    ColumnType,
    ColumnOption,
} from "@intutable/database/dist/column"
import {
    TableDescriptor,
    ViewDescriptor,
} from "@intutable/lazy-views/dist/types"

export const PK_COLUMN = "_id"

export type JoinSpec = {
    table: string
    fkColumn: Column
    pkColumn: string
    linkColumns: { name: string; attributes: Record<string, any> }[]
}
export type TableSpec = {
    name: string
    columns: { baseColumn: Column; attributes: Record<string, any> }[]
    joins: JoinSpec[]
}
export type Table = {
    baseTable: TableDescriptor
    tableView: ViewDescriptor
    filterView: ViewDescriptor
}

export const PERSONEN: TableSpec = {
    name: "Personen",
    columns: [
        {
            baseColumn: {
                name: "_id",
                type: ColumnType.increments,
                options: [ColumnOption.primary],
            },
            attributes: {
                displayName: "ID",
                _cellContentType: "number",
            },
        },
        {
            baseColumn: {
                name: "nachname",
                type: ColumnType.string,
            },
            attributes: {
                displayName: "Nachname",
                userPrimary: 1,
                _cellContentType: "string",
            },
        },
        {
            baseColumn: {
                name: "vorname",
                type: ColumnType.string,
            },
            attributes: {
                displayName: "Vorname",
                _cellContentType: "string",
            },
        },
        {
            baseColumn: {
                name: "titel",
                type: ColumnType.string,
            },
            attributes: {
                displayName: "Titel",
                _cellContentType: "string",
            },
        },
        {
            baseColumn: {
                name: "stellung",
                type: ColumnType.string,
            },
            attributes: {
                displayName: "Stellung",
                _cellContentType: "string",
            },
        },
    ],
    joins: [],
}

export const PERSONEN_DATA = [
    {
        nachname: "Gertz",
        vorname: "Michael",
        titel: "Prof. Dr.",
        stellung: "Professor",
    },
    {
        nachname: "Paech",
        vorname: "Barbara",
        titel: "Prof. Dr.",
        stellung: "Professor",
    },
    {
        nachname: "Fröning",
        vorname: "Holger",
        titel: "Prof. Dr.",
        stellung: "Professor",
    },
    {
        nachname: "Schmidt",
        vorname: "Jan-Philip",
        titel: "Dr.",
        stellung: "FK-Leitung",
    },
    {
        nachname: "Strzodka",
        vorname: "Robert",
        titel: "Prof. Dr.",
        stellung: "Professor",
    },
    {
        nachname: "Walcher",
        vorname: "Johannes",
        titel: "Prof. Dr.",
        stellung: "Professor",
    },
    {
        nachname: "Knüpfer",
        vorname: "Hans",
        titel: "Prof. Dr.",
        stellung: "Professor",
    },
    {
        nachname: "Albers",
        vorname: "Peter",
        titel: "Prof. Dr.",
        stellung: "Professor",
    },
    {
        nachname: "Johannes",
        vorname: "Jan",
        titel: "Prof. Dr.",
        stellung: "Professor",
    },
    {
        nachname: "Andrzejak",
        vorname: "Artur",
        titel: "Prof. Dr.",
        stellung: "Professor",
    },
]

export const ORGANE: TableSpec = {
    name: "Organe",
    columns: [
        {
            baseColumn: {
                name: "_id",
                type: ColumnType.increments,
                options: [ColumnOption.primary],
            },
            attributes: {
                displayName: "ID",
                _cellContentType: "number",
            },
        },
        {
            baseColumn: {
                name: "name",
                type: ColumnType.text,
            },
            attributes: {
                displayName: "Name",
                userPrimary: 1,
                _cellContentType: "string",
            },
        },
        {
            baseColumn: {
                name: "kuerzel",
                type: ColumnType.text,
            },
            attributes: {
                displayName: "Kürzel",
                _cellContentType: "string",
            },
        },
        {
            baseColumn: {
                name: "typ",
                type: ColumnType.text,
            },
            attributes: {
                displayName: "Typ",
                _cellContentType: "string",
            },
        },
        {
            baseColumn: {
                name: "fk_math_inf",
                type: ColumnType.text,
            },
            attributes: {
                displayName: "FK/Math/Inf",
                _cellContentType: "string",
            },
        },
    ],
    joins: [],
}

export const ORGANE_DATA = [
    {
        name: "Dekanat",
        kuerzel: "Dekanat",
        typ: "Einrichtung",
        fk_math_inf: "FK",
    },
    {
        name: "Fakultätsvorstand",
        kuerzel: "FK-Vorstand",
        typ: "Kommission",
        fk_math_inf: "FK",
    },
    {
        name: "Institut für Angewandte Mathematik",
        kuerzel: "IAM",
        typ: "Einrichtung",
        fk_math_inf: "Math",
    },
    {
        name: "Institut für Informatik",
        kuerzel: "IfI",
        typ: "Einrichtung",
        fk_math_inf: "Inf",
    },
    {
        name: "Institut für Technische Informatik",
        kuerzel: "ZITI",
        typ: "Einrichtung",
        fk_math_inf: "Inf",
    },
    {
        name: "Mathematisches Institut",
        kuerzel: "MI",
        typ: "Einrichtung",
        fk_math_inf: "Math",
    },
    {
        name: "PA BA und MA Informatik",
        kuerzel: "PA BA+MA Inf",
        typ: "Kommission",
        fk_math_inf: "Inf",
    },
    {
        name: "PA Informatik Promotionen",
        kuerzel: "PA Prom Inf",
        typ: "Kommission",
        fk_math_inf: "Inf",
    },
    {
        name: "PA Lehramt Informatik",
        kuerzel: "PA LA Inf",
        typ: "Kommission",
        fk_math_inf: "Inf",
    },
    {
        name: "PA Math Promotionen",
        kuerzel: "PA Prom Math",
        typ: "Kommission",
        fk_math_inf: "Math",
    },
    {
        name: "StuKo Informatik",
        kuerzel: "SK Inf",
        typ: "Kommission",
        fk_math_inf: "Inf",
    },
    {
        name: "StuKo Mathematik",
        kuerzel: "SK Math",
        typ: "Kommission",
        fk_math_inf: "Math",
    },
]

export const ROLLEN = {
    name: "Rollen",
    columns: [
        {
            baseColumn: {
                name: "_id",
                type: ColumnType.increments,
                options: [ColumnOption.primary],
            },
            attributes: {
                displayName: "ID",
                editable: 1,
                _cellContentType: "number",
            },
        },
        {
            baseColumn: {
                name: "rolle",
                type: ColumnType.string,
                options: [ColumnOption.nullable],
            },
            attributes: {
                displayName: "Rolle",
                userPrimary: 1,
                editable: 1,
                _cellContentType: "string",
            },
        },
    ],
    joins: [
        {
            table: "Personen",
            fkColumn: {
                name: "j#1_fk",
                type: ColumnType.integer,
            },
            pkColumn: "_id",
            linkColumns: [
                {
                    name: "nachname",
                    attributes: {
                        displayName: "Nachname",
                        editable: 0,
                        _kind: "link",
                        _cellContentType: "string",
                    },
                },
            ],
        },
        {
            table: "Organe",
            fkColumn: {
                name: "j#2_fk",
                type: ColumnType.integer,
            },
            pkColumn: "_id",
            linkColumns: [
                {
                    name: "name",
                    attributes: {
                        displayName: "Organ",
                        editable: 0,
                        _kind: "link",
                        _cellContentType: "string",
                    },
                },
            ],
        },
    ],
}

export const ROLLEN_DATA = [
    {
        rolle: "Prodekan",
        "j#1_fk": 10,
        "j#2_fk": 2,
    },
    {
        rolle: "Dekan",
        "j#1_fk": 6,
        "j#2_fk": 2,
    },
    {
        rolle: "Vorsitz",
        "j#1_fk": 3,
        "j#2_fk": 11,
    },
    {
        rolle: "Mitglied",
        "j#1_fk": 10,
        "j#2_fk": 11,
    },
    {
        rolle: "Vorsitz",
        "j#1_fk": 7,
        "j#2_fk": 12,
    },
    {
        rolle: "Vorsitz",
        "j#1_fk": 2,
        "j#2_fk": 9,
    },
    {
        rolle: "Vorsitz",
        "j#1_fk": 4,
        "j#2_fk": 1,
    },
    {
        rolle: "Vorsitz",
        "j#1_fk": 10,
        "j#2_fk": 8,
    },
    {
        rolle: "Vorsitz",
        "j#1_fk": 6,
        "j#2_fk": 10,
    },
]
