import { InputMask } from "../types"

const mask: InputMask = {
    id: "2671254B-B69E-45C7-8E17-DC71F037059A",
    origin: {
        projectId: 1,
        tableName: "Personen",
    },
    name: "Beispiel-Eingabemaske",
    description:
        "In der Tabelle 'Personen' sind alle Mitglieder der Fakultät für Mathematik und Informatik gelistet. Mit dieser Eingabemaske können beliebige Einträge der gesamten Tabelle hinzugefügt werden. Die Eingabemaske kann auf jede View angewandt werden.",
    created: new Date(2023, 1, 12),
    lastEdited: new Date(2023, 1, 12),
    addRecordButtonText: "Person hinzufügen",
    addRecordButtonIcon: "person_add",
    draftsCanBeDeleted: true,
    disabled: true, // <- only change
    comments: [],
    active: true,
    groups: [
        {
            label: "Name",
            index: 0,
            tooltip: "Ich bin ein Hinweis!",
            columns: [
                { name: "Titel", size: "3" },
                { name: "Vorname", size: "4" },
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
    components: [],
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
            // suppressInputLabel: true,
        },
        {
            origin: { name: "Raum" },
            index: 5,
            inputPlaceholderText: "Raum",
            // suppressInputLabel: true,
        },
        // andere
        {
            origin: { name: "Mail" },
            inputRequired: true,
        },
    ],
    constraints: [],
}
export default mask
