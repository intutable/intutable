import { InputMask } from "../types"

const mask: InputMask = {
    id: "804112D2-215A-4E52-8A54-AE1BCBE117F1",
    origin: {
        tableName: "Personen",
    },
    name: "Personen-Eingabemaske",
    description: "Mit dieser Eingabemaske können beliebige Einträge der Tabelle 'Personen' hinzugefügt werden.",
    created: new Date(2022, 11, 15),
    lastEdited: new Date(2023, 0, 15),
    addRecordButtonText: "Neue Person",
    comments: [
        {
            text: "Nachstehend die Änderungen, die dieser Eingabemaske hinzugefügt wurden!",
            user: "Entwickler",
            created: new Date(2023, 0, 15),
            highlighted: true,
        },
        {
            text: "Es wurde eine Gruppe aus den Spalten 'Titel'+'Vorname'+'Nachname' mit dem Gruppen-Label 'Name' erstellt und auf die Position '0' fixiert.",
            user: "Gruppe 1",
            created: new Date(2023, 0, 15),
        },
    ],
    active: true,
    groups: [
        {
            label: "Name",
            index: 0,
            tooltip: "Ich bin ein Hinweis!",
            columns: [
                { name: "Titel", size: "2" },
                { name: "Vorname", size: "5" },
                { name: "Nachname", size: "5" },
            ],
        },
        {
            label: "Adresse",
            index: 2,
            collapsable: true,
            collapsed: true,
            columns: [
                // Zeile 1
                { name: "Land", size: "2" },
                { name: "PLZ", size: "4" },
                { name: "Stadt", size: "6" },
                // Zeile 2
                { name: "Straße", size: "6" },
                { name: "Hausnummer", size: "3" },
                { name: "Raum", size: "3" },
            ],
        },
    ],
    components: [
        {
            __component: "note",
            index: 1,
            text: "Rolle*: (Platzhalter)",
        },
        { __component: "note", index: 998, text: "Mitglied in: (Platzhalter)" },
        { __component: "divider", index: 999, label: "Dekanats View" },
        { __component: "note", index: 1000, text: "Frage: Was soll hier stehen?" },
    ],
    columnProps: [
        // Gruppe 1
        {
            origin: { name: "Titel" },
            index: 0,
            disallowNewSelectValues: true,
            inputRequired: true,
            inputPlaceholderText: "Titel",
            suppressInputLabel: true,
        },
        {
            origin: { name: "Vorname" },
            index: 1,
            inputRequired: true,
            inputPlaceholderText: "Vorname",
            suppressInputLabel: true,
        },
        {
            origin: { name: "Nachname" },
            index: 2,
            inputRequired: true,
            inputPlaceholderText: "Nachname",
            suppressInputLabel: true,
        },
        // Gruppe 2
        {
            origin: { name: "Land" },
            index: 0,
            disallowNewSelectValues: true,
            inputRequired: true,
            inputPlaceholderText: "Land",
            suppressInputLabel: true,
        },
        {
            origin: { name: "PLZ" },
            index: 1,
            inputRequired: true,
            inputPlaceholderText: "PLZ",
            suppressInputLabel: true,
        },
        {
            origin: { name: "Stadt" },
            index: 2,
            inputRequired: true,
            inputPlaceholderText: "Stadt",
            suppressInputLabel: true,
        },
        {
            origin: { name: "Straße" },
            index: 3,
            inputRequired: true,
            inputPlaceholderText: "Straße",
            suppressInputLabel: true,
        },
        {
            origin: { name: "Hausnummer" },
            index: 4,
            inputRequired: true,
            inputPlaceholderText: "Hausnummer",
            suppressInputLabel: true,
        },
        {
            origin: { name: "Raum" },
            index: 5,
            inputPlaceholderText: "Raum",
            suppressInputLabel: true,
        },
        // andere
        {
            origin: { name: "Mail" },
            inputRequired: true,
        },
    ],
    rules: [],
}
export default mask
