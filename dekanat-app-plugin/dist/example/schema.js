"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLLEN_DATA = exports.ROLLEN = exports.ORGANE_DATA = exports.ORGANE = exports.PERSONEN_DATA = exports.PERSONEN = exports.PK_COLUMN = void 0;
/**
 * Specifications of example data.
 */
const column_1 = require("@intutable/database/dist/column");
const defaults_1 = require("../defaults");
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
            attributes: (0, defaults_1.standardColumnAttributes)("ID", "number", 0),
        },
        {
            baseColumn: {
                name: "index",
                type: column_1.ColumnType.integer,
                options: [],
            },
            attributes: (0, defaults_1.indexColumnAttributes)(1),
        },
        {
            baseColumn: {
                name: "nachname",
                type: column_1.ColumnType.string,
            },
            attributes: (0, defaults_1.standardColumnAttributes)("Nachname", "string", 2, true),
        },
        {
            baseColumn: {
                name: "vorname",
                type: column_1.ColumnType.string,
            },
            attributes: (0, defaults_1.standardColumnAttributes)("Vorname", "string", 3),
        },
        {
            baseColumn: {
                name: "titel",
                type: column_1.ColumnType.string,
            },
            attributes: (0, defaults_1.standardColumnAttributes)("Titel", "string", 4),
        },
        {
            baseColumn: {
                name: "stellung",
                type: column_1.ColumnType.string,
            },
            attributes: (0, defaults_1.standardColumnAttributes)("Stellung", "string", 5),
        },
    ],
    joins: [],
};
exports.PERSONEN_DATA = [
    {
        index: 0,
        nachname: "Andrzejak",
        vorname: "Artur",
        titel: "Prof. Dr.",
        stellung: "Professor",
    },
    {
        index: 1,
        nachname: "Gertz",
        vorname: "Michael",
        titel: "Prof. Dr.",
        stellung: "Professor",
    },
    {
        index: 2,
        nachname: "Paech",
        vorname: "Barbara",
        titel: "Prof. Dr.",
        stellung: "Professor",
    },
    {
        index: 3,
        nachname: "Fröning",
        vorname: "Holger",
        titel: "Prof. Dr.",
        stellung: "Professor",
    },
    {
        index: 4,
        nachname: "Schmidt",
        vorname: "Jan-Philip",
        titel: "Dr.",
        stellung: "FK-Leitung",
    },
    {
        index: 5,
        nachname: "Strzodka",
        vorname: "Robert",
        titel: "Prof. Dr.",
        stellung: "Professor",
    },
    {
        index: 6,
        nachname: "Walcher",
        vorname: "Johannes",
        titel: "Prof. Dr.",
        stellung: "Professor",
    },
    {
        index: 7,
        nachname: "Knüpfer",
        vorname: "Hans",
        titel: "Prof. Dr.",
        stellung: "Professor",
    },
    {
        index: 8,
        nachname: "Albers",
        vorname: "Peter",
        titel: "Prof. Dr.",
        stellung: "Professor",
    },
    {
        index: 9,
        nachname: "Johannes",
        vorname: "Jan",
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
            attributes: (0, defaults_1.standardColumnAttributes)("ID", "number", 0),
        },
        {
            baseColumn: {
                name: "index",
                type: column_1.ColumnType.integer,
                options: [],
            },
            attributes: (0, defaults_1.indexColumnAttributes)(1),
        },
        {
            baseColumn: {
                name: "name",
                type: column_1.ColumnType.text,
            },
            attributes: (0, defaults_1.standardColumnAttributes)("Name", "string", 2, true),
        },
        {
            baseColumn: {
                name: "kuerzel",
                type: column_1.ColumnType.text,
            },
            attributes: (0, defaults_1.standardColumnAttributes)("Kürzel", "string", 3),
        },
        {
            baseColumn: {
                name: "typ",
                type: column_1.ColumnType.text,
            },
            attributes: (0, defaults_1.standardColumnAttributes)("Typ", "string", 4),
        },
        {
            baseColumn: {
                name: "fk_math_inf",
                type: column_1.ColumnType.text,
            },
            attributes: (0, defaults_1.standardColumnAttributes)("FK/Math/Inf", "string", 5),
        },
    ],
    joins: [],
};
exports.ORGANE_DATA = [
    {
        index: 0,
        name: "StuKo Mathematik",
        kuerzel: "SK Math",
        typ: "Kommission",
        fk_math_inf: "Math",
    },
    {
        index: 1,
        name: "Dekanat",
        kuerzel: "Dekanat",
        typ: "Einrichtung",
        fk_math_inf: "FK",
    },
    {
        index: 2,
        name: "Fakultätsvorstand",
        kuerzel: "FK-Vorstand",
        typ: "Kommission",
        fk_math_inf: "FK",
    },
    {
        index: 3,
        name: "Institut für Angewandte Mathematik",
        kuerzel: "IAM",
        typ: "Einrichtung",
        fk_math_inf: "Math",
    },
    {
        index: 4,
        name: "Institut für Informatik",
        kuerzel: "IfI",
        typ: "Einrichtung",
        fk_math_inf: "Inf",
    },
    {
        index: 5,
        name: "Institut für Technische Informatik",
        kuerzel: "ZITI",
        typ: "Einrichtung",
        fk_math_inf: "Inf",
    },
    {
        index: 6,
        name: "Mathematisches Institut",
        kuerzel: "MI",
        typ: "Einrichtung",
        fk_math_inf: "Math",
    },
    {
        index: 7,
        name: "PA BA und MA Informatik",
        kuerzel: "PA BA+MA Inf",
        typ: "Kommission",
        fk_math_inf: "Inf",
    },
    {
        index: 8,
        name: "PA Informatik Promotionen",
        kuerzel: "PA Prom Inf",
        typ: "Kommission",
        fk_math_inf: "Inf",
    },
    {
        index: 9,
        name: "PA Lehramt Informatik",
        kuerzel: "PA LA Inf",
        typ: "Kommission",
        fk_math_inf: "Inf",
    },
    {
        index: 10,
        name: "PA Math Promotionen",
        kuerzel: "PA Prom Math",
        typ: "Kommission",
        fk_math_inf: "Math",
    },
    {
        index: 11,
        name: "StuKo Informatik",
        kuerzel: "SK Inf",
        typ: "Kommission",
        fk_math_inf: "Inf",
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
            attributes: (0, defaults_1.standardColumnAttributes)("ID", "number", 0),
        },
        {
            baseColumn: {
                name: "index",
                type: column_1.ColumnType.integer,
                options: [],
            },
            attributes: (0, defaults_1.indexColumnAttributes)(1),
        },
        {
            baseColumn: {
                name: "rolle",
                type: column_1.ColumnType.string,
                options: [column_1.ColumnOption.nullable],
            },
            attributes: (0, defaults_1.standardColumnAttributes)("Rolle", "string", 2, true),
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
                    attributes: (0, defaults_1.linkColumnAttributes)("Nachname", 3),
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
                    attributes: (0, defaults_1.linkColumnAttributes)("Organ", 4),
                },
            ],
        },
    ],
};
exports.ROLLEN_DATA = [
    {
        index: 0,
        rolle: "Vorsitz",
        "j#1_fk": 6,
        "j#2_fk": 10,
    },
    {
        index: 1,
        rolle: "Prodekan",
        "j#1_fk": 10,
        "j#2_fk": 2,
    },
    {
        index: 2,
        rolle: "Dekan",
        "j#1_fk": 6,
        "j#2_fk": 2,
    },
    {
        index: 3,
        rolle: "Vorsitz",
        "j#1_fk": 3,
        "j#2_fk": 11,
    },
    {
        index: 4,
        rolle: "Mitglied",
        "j#1_fk": 10,
        "j#2_fk": 11,
    },
    {
        index: 5,
        rolle: "Vorsitz",
        "j#1_fk": 7,
        "j#2_fk": 12,
    },
    {
        index: 6,
        rolle: "Vorsitz",
        "j#1_fk": 2,
        "j#2_fk": 9,
    },
    {
        index: 7,
        rolle: "Vorsitz",
        "j#1_fk": 4,
        "j#2_fk": 1,
    },
    {
        index: 8,
        rolle: "Vorsitz",
        "j#1_fk": 10,
        "j#2_fk": 8,
    },
];
