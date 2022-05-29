"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLLEN_DATA = exports.ROLLEN = exports.ORGANE_DATA = exports.ORGANE = exports.PERSONEN_DATA = exports.PERSONEN = exports.PK_COLUMN = void 0;
/**
 * Specifications of example data.
 */
const column_1 = require("@intutable/database/dist/column");
exports.PK_COLUMN = "_id";
exports.PERSONEN = {
    name: "Personen",
    columns: [
        {
            baseColumn: {
                name: "_id",
                type: column_1.ColumnType.increments,
                options: [column_1.ColumnOption.primary],
            },
            attributes: {
                displayName: "ID",
                editor: "number",
                formatter: "number",
            },
        },
        {
            baseColumn: {
                name: "nachname",
                type: column_1.ColumnType.string,
            },
            attributes: {
                displayName: "Nachname",
                userPrimary: 1,
                editor: "string",
                formatter: "string",
            },
        },
        {
            baseColumn: {
                name: "vorname",
                type: column_1.ColumnType.string,
            },
            attributes: {
                displayName: "Vorname",
                editor: "string",
                formatter: "string",
            },
        },
        {
            baseColumn: {
                name: "titel",
                type: column_1.ColumnType.string,
            },
            attributes: {
                displayName: "Titel",
                editor: "string",
                formatter: "string",
            },
        },
        {
            baseColumn: {
                name: "stellung",
                type: column_1.ColumnType.string,
            },
            attributes: {
                displayName: "Stellung",
                editor: "string",
                formatter: "string",
            },
        },
    ],
    joins: [],
};
exports.PERSONEN_DATA = [
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
];
exports.ORGANE = {
    name: "Organe",
    columns: [
        {
            baseColumn: {
                name: "_id",
                type: column_1.ColumnType.increments,
                options: [column_1.ColumnOption.primary],
            },
            attributes: {
                displayName: "ID",
                editor: "number",
                formatter: "number",
            },
        },
        {
            baseColumn: {
                name: "name",
                type: column_1.ColumnType.text,
            },
            attributes: {
                displayName: "Name",
                userPrimary: 1,
                editor: "string",
                formatter: "string",
            },
        },
        {
            baseColumn: {
                name: "kuerzel",
                type: column_1.ColumnType.text,
            },
            attributes: {
                displayName: "Kürzel",
                editor: "string",
                formatter: "string",
            },
        },
        {
            baseColumn: {
                name: "typ",
                type: column_1.ColumnType.text,
            },
            attributes: {
                displayName: "Typ",
                editor: "string",
                formatter: "string",
            },
        },
        {
            baseColumn: {
                name: "fk_math_inf",
                type: column_1.ColumnType.text,
            },
            attributes: {
                displayName: "FK/Math/Inf",
                editor: "string",
                formatter: "string",
            },
        },
    ],
    joins: [],
};
exports.ORGANE_DATA = [
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
];
exports.ROLLEN = {
    name: "Rollen",
    columns: [
        {
            baseColumn: {
                name: "_id",
                type: column_1.ColumnType.increments,
                options: [column_1.ColumnOption.primary],
            },
            attributes: {
                displayName: "ID",
                editable: 1,
                editor: "number",
                formatter: null,
            },
        },
        {
            baseColumn: {
                name: "rolle",
                type: column_1.ColumnType.string,
                options: [column_1.ColumnOption.nullable],
            },
            attributes: {
                displayName: "Rolle",
                userPrimary: 1,
                editable: 1,
                editor: "string",
                formatter: "string",
            },
        },
    ],
    joins: [
        {
            table: "Personen",
            fkColumn: {
                name: "j#1_fk",
                type: column_1.ColumnType.integer,
            },
            pkColumn: "_id",
            linkColumns: [
                {
                    name: "nachname",
                    attributes: {
                        displayName: "Nachname",
                        editable: 0,
                        editor: null,
                        formatter: "linkColumn",
                        _kind: "link",
                    },
                },
            ],
        },
        {
            table: "Organe",
            fkColumn: {
                name: "j#2_fk",
                type: column_1.ColumnType.integer,
            },
            pkColumn: "_id",
            linkColumns: [
                {
                    name: "name",
                    attributes: {
                        displayName: "Organ",
                        editable: 0,
                        editor: null,
                        formatter: "linkColumn",
                        _kind: "link",
                    },
                },
            ],
        },
    ],
};
exports.ROLLEN_DATA = [
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
];
