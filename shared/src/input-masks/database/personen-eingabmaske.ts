import { InputMask } from "../types"

const mask: InputMask = {
    id: "804112D2-215A-4E52-8A54-AE1BCBE117F1",
    origin: {
        projectId: 1,
        tableName: "Personen",
    },
    name: "Personen-Eingabemaske",
    description:
        "In der Tabelle 'Personen' sind alle Mitglieder der Fakultät für Mathematik und Informatik gelistet. Mit dieser Eingabemaske können beliebige Einträge der gesamten Tabelle hinzugefügt werden. Die Eingabemaske kann auf jede View angewandt werden.",
    created: new Date(2022, 11, 15),
    lastEdited: new Date(2023, 6, 7),
    addRecordButtonText: "Person hinzufügen",
    addRecordButtonIcon: "person_add",
    draftsCanBeDeleted: true,
    comments: [],
    active: true,
    groups: [
        {
            label: "Name",
            index: 0,
            columns: [
                { name: "Akademischer Grad", size: "3" },
                { name: "Vorname", size: "4" },
                { name: "Nachname", size: "5" },
            ],
        },
        {
            label: "Uni-Daten",
            index: 1,
            columns: [
                { name: "Uni ID", size: "5" },
                { name: "Primary Mail", size: "7" },
            ],
        },
    ],
    components: [{ __component: "divider", index: 3 }],
    columnProps: [
        // Gruppe 1
        {
            origin: { name: "Akademischer Grad" },
            index: 0,
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
    constraints: [],
}
export default mask
