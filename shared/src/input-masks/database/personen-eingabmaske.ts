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
    ],
    columnProps: [
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
    ],
    rules: [],
}
export default mask
