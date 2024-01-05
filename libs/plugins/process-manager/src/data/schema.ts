import { Column, ColumnType } from "@intutable-org/database/dist/types"
import { AutomaticStepTemplate, ProcessState, StepType, TimeUnit } from "../types"

const tableNamePrefix = "process-manager_"
export const tableNames = {
    workflows: tableNamePrefix + "workflows",
    automatic_steps: tableNamePrefix + "automatic-steps",
    jobs: tableNamePrefix + "jobs",
}

const WORKFLOWS: Column[] = [
    {
        name: "_id",
        type: ColumnType.string,
    },
    {
        name: "index",
        type: ColumnType.integer,
    },
    {
        name: "name",
        type: ColumnType.string,
    },
    {
        name: "description",
        type: ColumnType.string,
    },
    {
        name: "steps",
        type: ColumnType.text,
    },
    {
        name: "connections",
        type: ColumnType.text,
    },
    {
        name: "startstep",
        type: ColumnType.string,
    },
    {
        name: "history",
        type: ColumnType.text,
    },
    {
        name: "owner",
        type: ColumnType.integer,
    },
    {
        name: "state",
        type: ColumnType.string,
    },
    {
        name: "majorsteps",
        type: ColumnType.text,
    },
]

const WORKFLOW_DATA = [
    {
        _id: "Dekanat_App_Template_Phd_Admission",
        index: 0,
        name: "PHD-Anmeldung",
        description: "Anmeldung auf eine Phd-Stelle",
        steps: JSON.stringify([
            {
                _id: "ead14853-ea57-4573-a2c9-ef96700f3acd",
                name: "Phd-Bewerber(in) übermittelt Bewerbungsformular",
                description: "Bewerber(in) übermittelt ein Bewerbungsformular auf eine Phd-Stelle.",
                type: StepType.Manual,
                trigger: "PHDBewerbung.ÜbermittlungBewerbungsformular",
                responsible: null,
                state: ProcessState.Pending,
            },
            {
                _id: "467294db-72bd-4816-9035-1bd3691432d0",
                name: "Dekanatsbüro akzeptiert Phd-Bewerbung",
                description: "Dekanatsbüro akzeptiert die eingegangene Phd-Bewerbung.",
                type: StepType.Manual,
                trigger: "PHDBewerbung.BewerbungAkzeptiert",
                responsible: 0,
                state: ProcessState.NotStarted,
            },
            {
                _id: "6fe3cc66-312c-42a5-a4e9-86eda9e4e819",
                name: "Dekanatsbüro lehnt Phd-Bewerbung ab",
                description: "Dekanatsbüro lehnt die eingegangene Phd-Bewerbung ab.",
                type: StepType.Manual,
                trigger: "PHDBewerbung.BewerbungAbgelehnt",
                responsible: 0,
                state: ProcessState.NotStarted,
            },
            {
                _id: "2c5a826a-f8c4-4483-88b0-ea59661702b1",
                name: "Professor(in) akzeptiert Phd-Bewerbung",
                description:
                    "Der/Die Professor(in) akzeptiert die Phd-Bewerbung mit den erfüllten Anforderungen.",
                type: StepType.Manual,
                trigger: "PHDBewerbung.PhdStelleAkzeptiert",
                responsible: 0,
                state: ProcessState.NotStarted,
            },
            {
                _id: "9d310049-0d00-4033-8793-1114cebf1db9",
                name: "Professor(in) lehnt Phd-Bewerbung ab",
                description: "Der/Die Professor(in) lehnt die Phd-Bewerbung ab.",
                type: StepType.Manual,
                trigger: "PHDBewerbung.PhdStelleAbgelehnt",
                responsible: 0,
                state: ProcessState.NotStarted,
            },
            {
                _id: "390bbd63-cdd7-409f-9cb1-05d69b94049f",
                name: "Professor(in) fügt Anforderungen an die Phd-Bewerbung an",
                description: "Der/Die Professor(in) fügt der Phd-Bewerbung Anforderungen an.",
                type: StepType.Manual,
                trigger: "PHDBewerbung.PhdStelleAnforderungenHinzugefügt",
                responsible: 0,
                state: ProcessState.NotStarted,
            },
            {
                _id: "8ac03d2e-ebbd-47b0-bc1c-5fe3dbd5c81d",
                name: "Phd-Bewerber(in) fügt Zertifikate bei",
                description: "Phd-Bewerber(in) fügt Zertifikate der erfüllten Anforderungen bei.",
                type: StepType.Manual,
                trigger: "PHDBewerbung.PhdAnforderungenÜbermittelt",
                responsible: null,
                state: ProcessState.NotStarted,
            },
            {
                _id: "10cca426-d0be-45d9-827a-98a7bf9a695e",
                name: "Phd-Bewerber(in) erhält Eingangsbestätigung",
                description:
                    "Der/Die Phd-Bewerber(in) erhält eine Eingangsbestätigung der Bewerbungsunterlagen.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "EmailVersenden",
                data: {
                    emailTo: "%%webForm_phdAdmission.$$.email%%",
                    emailSubject: "[NO REPLY] PHD-Bewerbung",
                    emailContent: `Sehr geehrte(r) %%webForm_phdAdmission.$$.firstname%% %%webForm_phdAdmission.$$.lastname%%,

Ihre Bewerbung auf eine Phd-Stelle an der Universität Heidelberg ist eingegangen.
Ihre Bewerbung können Sie jederzeit unter folgendem Link anpassen:
https://dekanats-app.uni-heidelberg.de/PHDAnmeldung?id=%%process-manager_workflows.$$._id%%

Mit freundlichen Grüßen,
Dekanats-App

Diese E-Mail wurde automatisch erstellt.
Bitte antworten Sie nicht auf diese E-Mail.`,
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "4b5e4757-386b-44cd-8076-f13ea717155f",
                name: "Phd-Bewerber(in) über Anforderungen informiert",
                description:
                    "Der/Die Phd-Bewerber(in) wird über zusätzliche Anforderungen informiert.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "EmailVersenden",
                data: {
                    emailTo: "%%webForm_phdAdmission.$$.email%%",
                    emailSubject: "[NO REPLY] PHD Admission: Additional requirements",
                    emailContent: `Sehr geehrte(r) %%webForm_phdAdmission.$$.firstname%% %%webForm_phdAdmission.$$.lastname%%,

Ihrer Bewerbung auf eine Phd-Stelle an der Universität Heidelberg wurden weitere Anforderungen beigefügt.
Bitte erfüllen Sie diese innerhalb der nächsten 2 Jahre.

Neue Anforderungen:
%%webForm_phdAdmission.$$.requirements%%

Die Zertifikate über die bestandenen Veranstaltungen können Sie hier hochladen:
https://dekanats-app.uni-heidelberg.de/PHDAnmeldung?id=%%process-manager_workflows.$$.id%%

Mit freundlichen Grüßen,
Dekanats-App

Diese E-Mail wurde automatisch erstellt.
Bitte antworten Sie nicht auf diese E-Mail.`,
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "8d04d68c-a8a7-465e-bc03-55ec727c2bef",
                name: "Dekan(in) sendet Phd-Bewerbungsablehnung",
                description:
                    "Der/Die Dekan(in) wird per E-Mail informiert, dass der/die Phd-Bewerber(in) abgelehnt wurde.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "EmailVersenden",
                data: {
                    emailTo: "dean@uni-heidelberg.de",
                    emailSubject: "[NO REPLY] Phd-Anmeldung: endgültig abgelehnt",
                    emailContent: `Sehr geehrte(r) Dekan(in),

Die folgende Phd-Anmeldung wurde endgültig abgelehnt:
Vorname: %%webForm_phdAdmission.$$.firstname%%
Nachname: %%webForm_phdAdmission.$$.lastname%%
E-mail: %%webForm_phdAdmission.$$.email%%

Bitte informieren sie den/die Bewerber(in) über diese Entscheidung.

Mit freundlichen Grüßen,
Dekanats-App

Diese E-Mail wurde automatisch erstellt.
Bitte antworten Sie nicht auf diese E-Mail.`,
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "83a8c0e2-f9e6-45a6-9176-31afac567c30",
                name: "Dekan(in) sendet Phd-Bewerbungsbestätigung",
                description:
                    "Der/Die Dekan(in) wird per E-Mail informiert, dass der/die Phd-Bewerber(in) akzeptiert wurde.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "EmailVersenden",
                data: {
                    emailTo: "dean@uni-heidelberg.de",
                    emailSubject: "[NO REPLY] PHD Admission: accepted",
                    emailContent: `Sehr geehrte(r) Dekan(in),

Die folgende Phd-Anmeldung wurde akzeptiert:
Vorname: %%webForm_phdAdmission.$$.firstname%%
Nachname: %%webForm_phdAdmission.$$.lastname%%
E-mail: %%webForm_phdAdmission.$$.email%%

Bitte informieren Sie den/die Bewerber(in) über diese Entscheidung.

Mit freundlichen Grüßen,
Dekanats-App

Diese E-Mail wurde automatisch erstellt.
Bitte antworten Sie nicht auf diese E-Mail.`,
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "198b312b-3739-4f63-a538-6410376c3fb8",
                name: "Prozess PHD-Anmeldung umbenennen",
                description:
                    "Der Prozess PHD-Anmeldung wird umbenannt, um ihn so von den anderen Prozessen zu unterscheiden.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "ProzessInfosVerändern",
                data: {
                    name: "%%process-manager_workflows.$$.name%% - %%webForm_phdAdmission.$$.firstname%% %%webForm_phdAdmission.$$.lastname%%",
                },
                state: ProcessState.NotStarted,
            },
        ]),
        connections: JSON.stringify({
            "ead14853-ea57-4573-a2c9-ef96700f3acd": ["198b312b-3739-4f63-a538-6410376c3fb8"],
            "198b312b-3739-4f63-a538-6410376c3fb8": ["10cca426-d0be-45d9-827a-98a7bf9a695e"],
            "10cca426-d0be-45d9-827a-98a7bf9a695e": [
                "467294db-72bd-4816-9035-1bd3691432d0",
                "6fe3cc66-312c-42a5-a4e9-86eda9e4e819",
            ],
            "467294db-72bd-4816-9035-1bd3691432d0": [
                "2c5a826a-f8c4-4483-88b0-ea59661702b1",
                "9d310049-0d00-4033-8793-1114cebf1db9",
                "390bbd63-cdd7-409f-9cb1-05d69b94049f",
            ],
            "6fe3cc66-312c-42a5-a4e9-86eda9e4e819": ["ead14853-ea57-4573-a2c9-ef96700f3acd"],
            "2c5a826a-f8c4-4483-88b0-ea59661702b1": ["83a8c0e2-f9e6-45a6-9176-31afac567c30"],
            "9d310049-0d00-4033-8793-1114cebf1db9": ["8d04d68c-a8a7-465e-bc03-55ec727c2bef"],
            "390bbd63-cdd7-409f-9cb1-05d69b94049f": ["4b5e4757-386b-44cd-8076-f13ea717155f"],
            "4b5e4757-386b-44cd-8076-f13ea717155f": ["8ac03d2e-ebbd-47b0-bc1c-5fe3dbd5c81d"],
            "8ac03d2e-ebbd-47b0-bc1c-5fe3dbd5c81d": [
                "2c5a826a-f8c4-4483-88b0-ea59661702b1",
                "9d310049-0d00-4033-8793-1114cebf1db9",
                "390bbd63-cdd7-409f-9cb1-05d69b94049f",
            ],
        }),
        startstep: "ead14853-ea57-4573-a2c9-ef96700f3acd",
        history: JSON.stringify([]),
        owner: 0,
        state: ProcessState.Pending,
        majorsteps: JSON.stringify([
            "ead14853-ea57-4573-a2c9-ef96700f3acd", // PHDBewerbung.ÜbermittlungBewerbungsformular
            "467294db-72bd-4816-9035-1bd3691432d0", // PHDBewerbung.BewerbungAkzeptiert
            "390bbd63-cdd7-409f-9cb1-05d69b94049f", // PHDBewerbung.PhdStelleAnforderungenHinzugefügt
            "8ac03d2e-ebbd-47b0-bc1c-5fe3dbd5c81d", // PHDBewerbung.PhdAnforderungenÜbermittelt
            "2c5a826a-f8c4-4483-88b0-ea59661702b1", // PHDBewerbung.PhdStelleAkzeptiert
        ]),
    },
    {
        _id: "Dekanat_App_Template_Hiwi_Request",
        index: 1,
        name: "Hiwi-Anfrage",
        description: "Anfrage benötigter Hiwi-Stellen für eine Veranstaltung.",
        steps: JSON.stringify([
            {
                _id: "68d980e6-06b1-4c02-bc9e-b452edf25c64",
                name: "Übermittlung der benötigten Anzahl an Hiwi-Stellen",
                description:
                    "Übermittlung der benötigten Anzahl an Hiwi-Stellen für eine Veranstaltung.",
                type: StepType.Manual,
                trigger: "HIWIAnfrage.ÜbermittlungBenötigterAnzahl",
                responsible: null,
                state: ProcessState.Pending,
            },
            {
                _id: "1c8bfe2a-a5b1-436a-bb24-f22dde36624a",
                name: "Veranstalter wird über den Erhalt der Hiwi-Anfrage informiert",
                description:
                    "Veranstalter wird über den Erhalt der Hiwi-Anfrage informiert und erhält permanenten Link.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "EmailVersenden",
                data: {
                    emailTo: "%%hiwirequests.$$.email%%",
                    emailSubject:
                        "[NO REPLY] Hiwi-Anfrage eingetragen: %%hiwirequests.$$.lecturetitle%%",
                    emailContent: `Sehr geehrte(r) %%hiwirequests.$$.firstname%% %%hiwirequests.$$.lastname%%,

Ihre Anfrage auf Hiwi-Stellen für die Veranstaltung %%hiwirequests.$$.lecturetitle%% ist erfolgreich eingegangen.

Ihre Anfrage kann jederzeit unter folgendem Link verändert werden.
https://dekanats-app.uni-heidelberg.de/HiwiAnfrage?id=%%process-manager_workflows.$$._id%%

Mit freundlichen Grüßen,
Dekanats-App

Diese E-Mail wurde automatisch erstellt.
Bitte antworten Sie nicht auf diese E-Mail.`,
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "a4250541-f78d-4203-9766-7935bc67456c",
                name: "Prozess Hiwi Anfrage umbenennen",
                description:
                    "Der Prozess Hiwi-Anfrage wird umbenannt, um ihn so von den anderen Prozessen zu unterscheiden.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "ProzessInfosVerändern",
                data: {
                    name: "%%process-manager_workflows.$$.name%% - %%hiwirequests.$$.lecturetitle%%",
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "777f7e1d-0437-4108-a34c-81991aeebf3c",
                name: "Prüfe auf Festlegung der Anzahl der Hiwi-Stellen",
                description:
                    "Prüft, ob bereits festgelegt wurde, wie viele Hiwi-Stellen an die Veranstaltung vergeben werden.",
                type: StepType.Automatic,
                delay: {
                    value: 1,
                    unit: TimeUnit.Days,
                },
                trigger: "GegenKonstantePrüfen",
                data: {
                    operator: "==",
                    tableName: "hiwirequests",
                    columnName: "confirmed",
                    rowId: "$$",
                    constant: "Ja",
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "8c4d2960-c669-4a80-b62d-ded7070f8f61",
                name: "Informiere Veranstalter über zugewiesene Hiwi-Stellen",
                description:
                    "Informiert Veranstalter über die Anzahl der zugewiesenen Hiwi-Stellen für eine Veranstaltung.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "EmailVersenden",
                data: {
                    emailTo: "%%hiwirequests.$$.email%%",
                    emailSubject:
                        "[NO REPLY] Hiwi-Stellen festgelegt für: %%hiwirequests.$$.lecturetitle%%",
                    emailContent: `Sehr geehrte(r) %%hiwirequests.$$.firstname%% %%hiwirequests.$$.lastname%%,

Die Anzahl der Hiwi-Stellen wurde für die Veranstaltung %%hiwirequests.$$.lecturetitle%% festgelegt.
Sie erhalten die Möglichkeit insgesamt %%hiwirequests.$$.assigned%% einzustellen.
Bitte tragen Sie dazu deren Kontaktdaten in die Dekanats-App ein.

Die Eingabe können Sie unter folgendem Link erreichen:
https://dekanats-app.uni-heidelberg.de/HiwiDaten?id=%%process-manager_workflows.$$._id%%

Mit freundlichen Grüßen,
Dekanats-App

Diese E-Mail wurde automatisch erstellt.
Bitte antworten Sie nicht auf diese E-Mail.`,
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "73f1741c-4741-412a-b5eb-e54e8ecea3ca",
                name: "Übermittlung der personenbezogenen Daten für Hiwi-Stellen",
                description:
                    "Übermittlung der personenbezogenen Daten für Hiwi-Stellen für eine Veranstaltung.",
                type: StepType.Manual,
                trigger: "HIWIAnfrage.ÜbermittlungPersonenbezogenerDaten",
                responsible: null,
                state: ProcessState.NotStarted,
            },
            {
                _id: "a07a96eb-64eb-48fe-a6fe-07554cc970d8",
                name: "Veranstalter wird informiert, dass die personenbezogenen Daten erhalten wurden",
                description:
                    "Veranstalter wird informiert, dass die personenbezogenen Daten erhalten wurden.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "EmailVersenden",
                data: {
                    emailTo: "%%hiwirequests.$$.email%%",
                    emailSubject:
                        "[NO REPLY] Hiwi-Stellen eingetragen: %%hiwirequests.$$.lecturetitle%%",
                    emailContent: `Sehr geehrte(r) %%hiwirequests.$$.firstname%% %%hiwirequests.$$.lastname%%,

Die personenbezogenen Daten für die Hiwi-Stellen der Veranstaltung %%hiwirequests.$$.lecturetitle%% wurden erfasst.
Sie können diese Daten jederzeit ändern. Falls sich noch Änderungen ergeben, nutzen Sie dazu weiterhin den Ihnen bekannten Link:
https://dekanats-app.uni-heidelberg.de/HiwiDaten?id=%%process-manager_workflows.$$._id%%

Bitte senden Sie den folgenden Link an die von Ihnen angeben Personen, damit diese sich als Hiwi bewerben können.
https://dekanats-app.uni-heidelberg.de/HiwiBewerbung?id=%%process-manager_workflows.$$._id%%&lecture=%%hiwirequests.$$.lecturetitle%%

Mit freundlichen Grüßen,
Dekanats-App

Diese E-Mail wurde automatisch erstellt.
Bitte antworten Sie nicht auf diese E-Mail.`,
                },
                state: ProcessState.NotStarted,
            },
        ]),
        connections: JSON.stringify({
            "68d980e6-06b1-4c02-bc9e-b452edf25c64": ["1c8bfe2a-a5b1-436a-bb24-f22dde36624a"],
            "1c8bfe2a-a5b1-436a-bb24-f22dde36624a": ["a4250541-f78d-4203-9766-7935bc67456c"],
            "a4250541-f78d-4203-9766-7935bc67456c": ["777f7e1d-0437-4108-a34c-81991aeebf3c"],
            "777f7e1d-0437-4108-a34c-81991aeebf3c": [
                "8c4d2960-c669-4a80-b62d-ded7070f8f61",
                "777f7e1d-0437-4108-a34c-81991aeebf3c",
            ],
            "8c4d2960-c669-4a80-b62d-ded7070f8f61": ["73f1741c-4741-412a-b5eb-e54e8ecea3ca"],
            "73f1741c-4741-412a-b5eb-e54e8ecea3ca": ["a07a96eb-64eb-48fe-a6fe-07554cc970d8"],
        }),
        startstep: "68d980e6-06b1-4c02-bc9e-b452edf25c64",
        history: JSON.stringify([]),
        owner: 0,
        state: ProcessState.Pending,
        majorsteps: JSON.stringify([
            "68d980e6-06b1-4c02-bc9e-b452edf25c64", // HIWIAnfrage.ÜbermittlungBenötigterAnzahl
            "8c4d2960-c669-4a80-b62d-ded7070f8f61", // EmailVersenden - Anzahl der Hiwis Festgelegt
            "73f1741c-4741-412a-b5eb-e54e8ecea3ca", // HIWIAnfrage.ÜbermittlungPersonenbezogenerDaten
            "a07a96eb-64eb-48fe-a6fe-07554cc970d8", // EmailVersenden - Bitte Bewerbungsschreiben verschicken
        ]),
    },
    {
        _id: "Dekanat_App_Template_Hiwi_Numbers",
        index: 2,
        name: "Hiwi-Zahlen",
        description: "Festsetzung der benötigten und bestätigten Hiwi-Stellen.",
        steps: JSON.stringify([
            {
                _id: "828a4d13-0604-449e-80e7-47dc993c5a30",
                name: "Übermittlung der benötigten Anzahl an Hiwi-Stellen",
                description:
                    "Übermittlung der benötigten Anzahl an Hiwi-Stellen für alle Veranstaltungen.",
                type: StepType.Manual,
                trigger: "HIWIZahlen.ÜbermittlungBenötigterAnzahl",
                responsible: 0,
                state: ProcessState.Pending,
            },
            {
                _id: "12359a4f-f96f-47ac-bfbe-2f6d516f4e44",
                name: "Bestätigung der Anzahl der benötigten Hiwi-Stellen",
                description:
                    "Bestätigung der Anzahl der benötigten Hiwi-Stellen für alle Veranstaltungen.",
                type: StepType.Manual,
                trigger: "HIWIZahlen.BestätigungBenötigterAnzahl",
                responsible: 0,
                state: ProcessState.NotStarted,
            },
            {
                _id: "9acbf287-b4c1-445d-95a0-dfaa76ea3561",
                name: "Kürzung der Anzahl der benötigten Hiwi-Stellen",
                description:
                    "Kürzung der Anzahl der benötigten Hiwi-Stellen für alle Veranstaltungen.",
                type: StepType.Manual,
                trigger: "HIWIZahlen.KürzungBenötigterAnzahl",
                responsible: 0,
                state: ProcessState.NotStarted,
            },
            {
                _id: "4ae4af2d-1d44-4791-bf8d-86c384079f8a",
                name: "Korrektur der Anzahl der benötigten Hiwi-Stellen",
                description:
                    "Korrektur der Anzahl der benötigten Hiwi-Stellen für alle Veranstaltungen.",
                type: StepType.Manual,
                trigger: "HIWIZahlen.ÜbermittlungBenötigterAnzahl",
                responsible: 0,
                state: ProcessState.NotStarted,
            },
        ]),
        connections: JSON.stringify({
            "828a4d13-0604-449e-80e7-47dc993c5a30": [
                "12359a4f-f96f-47ac-bfbe-2f6d516f4e44",
                "9acbf287-b4c1-445d-95a0-dfaa76ea3561",
            ],
            "9acbf287-b4c1-445d-95a0-dfaa76ea3561": ["4ae4af2d-1d44-4791-bf8d-86c384079f8a"],
            "4ae4af2d-1d44-4791-bf8d-86c384079f8a": [
                "12359a4f-f96f-47ac-bfbe-2f6d516f4e44",
                "9acbf287-b4c1-445d-95a0-dfaa76ea3561",
            ],
        }),
        startstep: "828a4d13-0604-449e-80e7-47dc993c5a30",
        history: JSON.stringify([]),
        owner: 0,
        state: ProcessState.Pending,
        majorsteps: JSON.stringify([
            "828a4d13-0604-449e-80e7-47dc993c5a30", // HIWIZahlen.ÜbermittlungBenötigterAnzahl
            "12359a4f-f96f-47ac-bfbe-2f6d516f4e44", // HIWIZahlen.BestätigungBenötigterAnzahl
        ]),
    },
    {
        _id: "Dekanat_App_Template_Hiwi_Application",
        index: 2,
        name: "Hiwi Anmeldung",
        description: "Anmeldung auf eine Hiwi-Stelle.",
        steps: JSON.stringify([
            {
                _id: "6c725c4f-1304-463a-99c0-fd0b5b42a11a",
                name: "Übermittlung des Hiwi-Bewerbungsformulars",
                description: "Übermittlung des Bewerbungsformulars auf eine Hiwi-Stelle.",
                type: StepType.Manual,
                trigger: "HIWIBewerbung.ÜbermittlungBewerbungsformular",
                responsible: null,
                state: ProcessState.Pending,
            },
            {
                _id: "7a568b13-8a9a-49b1-8bda-e4bf44afdb12",
                name: "Hiwi-Bewerber(in) wird über den Erhalt der Bewerbung informiert",
                description:
                    "Hiwi-Bewerber(in) wird über den Erhalt der Bewerbung informiert und erhält permanenten link.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "EmailVersenden",
                data: {
                    emailTo: "%%hiwiadmission.$$.email%%",
                    emailSubject:
                        "[NO REPLY] Hiwi-Bewerbung für %%hiwiadmission.$$.lecturetitle%% eingegangen",
                    emailContent: `Sehr geehrte(r) %%hiwiadmission.$$.firstname%% %%hiwiadmission.$$.lastname%%,

Ihre Bewerbung auf eine Hiwi-Stelle für die Veranstaltung %%hiwiadmission.$$.lecturetitle%% ist erfolgreich eingegangen.

Ihre Bewerbung kann jederzeit unter folgendem Link verändert werden.
https://dekanats-app.uni-heidelberg.de/HiwiBewerbung?id=%%process-manager_workflows.$$._id%%&lecture=%%hiwiadmission.$$.lecturetitle%%

Mit freundlichen Grüßen,
Dekanats-App

Diese E-Mail wurde automatisch erstellt.
Bitte antworten Sie nicht auf diese E-Mail.`,
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "4ace63f4-3efc-417b-b7bf-0e1363fb79ea",
                name: "Prozess Hiwi-Anmeldung umbenennen",
                description:
                    "Der Prozess Hiwi-Anmeldung wird umbenannt, um ihn so von den anderen Prozessen zu unterscheiden.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "ProzessInfosVerändern",
                data: {
                    name: "%%process-manager_workflows.$$.name%% - %%hiwiadmission.$$.firstname%% %%hiwiadmission.$$.lastname%%",
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "36e286f4-3ec1-4f9d-9a38-349f21a8a7ac",
                name: "Bestätigung des Bewerbungsformulars",
                description: "Bestätigung des Bewerbungsformulars auf eine Hiwi-Stelle.",
                type: StepType.Manual,
                trigger: "HIWIBewerbung.BestätigungBewerbungsformular",
                responsible: 0,
                state: ProcessState.NotStarted,
            },
            {
                _id: "e8c9b934-9969-436f-9837-be8256ef7126",
                name: "Ablehnung des Bewerbungsformulars",
                description: "Ablehnung des Bewerbungsformulars auf eine Hiwi-Stelle.",
                type: StepType.Manual,
                trigger: "HIWIBewerbung.AblehnungBewerbungsformular",
                responsible: 0,
                state: ProcessState.NotStarted,
            },
            {
                _id: "a5baf34d-0f4a-497c-98a1-62666bef7402",
                name: "Hiwi-Bewerber(in) wird über die Ablehnung der Bewerbung informiert",
                description: "Hiwi-Bewerber(in) wird über die Ablehnung der Bewerbung informiert.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "EmailVersenden",
                data: {
                    emailTo: "%%hiwiadmission.$$.email%%",
                    emailSubject:
                        "[NO REPLY] Hiwi-Bewerbung für %%hiwiadmission.$$.lecturetitle%% abgelehnt",
                    emailContent: `Sehr geehrte(r) %%hiwiadmission.$$.firstname%% %%hiwiadmission.$$.lastname%%,

Ihre Bewerbung auf eine Hiwi-Stelle für die Veranstaltung %%hiwiadmission.$$.lecturetitle%% wurde leider abgelehnt.
Bitte überprüfen Sie, ob die von Ihnen gemachten Angaben korrekt und vollständig sind.
Sollten Sie Fragen haben, kontaktieren Sie bitte das Studiensekretariat der Fachschaft Mathe und Informatik.

Ihre Bewerbung kann jederzeit unter folgendem Link verändert werden und erneut abgeschickt werden.
https://dekanats-app.uni-heidelberg.de/HiwiBewerbung?id=%%process-manager_workflows.$$._id%%&lecture=%%hiwiadmission.$$.lecturetitle%%

Mit freundlichen Grüßen,
Dekanats-App

Diese E-Mail wurde automatisch erstellt.
Bitte antworten Sie nicht auf diese E-Mail.`,
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "77187c7f-6134-413c-b40a-9f307cba6905",
                name: "Korrektur des Bewerbungsformulars",
                description: "Korrektur des Bewerbungsformulars auf eine Hiwi-Stelle.",
                type: StepType.Manual,
                trigger: "HIWIBewerbung.ÜbermittlungBewerbungsformular",
                responsible: null,
                state: ProcessState.NotStarted,
            },
            {
                _id: "0c043b94-b441-4b5b-85f4-83198c434080",
                name: "Hiwi-Bewerber(in) wird über die Bestätigung der Bewerbung informiert",
                description:
                    "Hiwi-Bewerber(in) wird informiert und erhält einen Link zu den Antragseinstellungsunterlagen.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "EmailVersenden",
                data: {
                    emailTo: "%%hiwiadmission.$$.email%%",
                    emailSubject:
                        "[NO REPLY] Hiwi-Bewerbung für %%hiwiadmission.$$.lecturetitle%% akzeptiert",
                    emailContent: `Sehr geehrte(r) %%hiwiadmission.$$.firstname%% %%hiwiadmission.$$.lastname%%,

Wir freuen uns Ihnen mitteilen zu können, dass Ihre Bewerbung für eine Hiwi-Stelle für die Veranstaltung %%hiwiadmission.$$.lecturetitle%%,
akzeptiert wurde.

Damit Sie als Hiwi arbeiten können, benötigen wir noch weitere Angaben von Ihnen.
Um diese einzureichen, folgen Sie bitte einfach dem nachfolgenden Link:
https://dekanats-app.uni-heidelberg.de/HiwiAntragseinstellungsunterlagen?id=%%process-manager_workflows.$$._id%%&lecture=%%hiwiadmission.$$.lecturetitle%%

Mit freundlichen Grüßen,
Dekanats-App

Diese E-Mail wurde automatisch erstellt.
Bitte antworten Sie nicht auf diese E-Mail.`,
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "4a9c9d6a-5134-4279-bcbb-377d97de9b41",
                name: "Übermittlung der Antragseinstellungsunterlagen",
                description: "Übermittlung der Antragseinstellungsunterlagen auf eine Hiwi-Stelle.",
                type: StepType.Manual,
                trigger: "HIWIBewerbung.ÜbermittlungAntragseinstellungsunterlagen",
                responsible: null,
                state: ProcessState.NotStarted,
            },
            {
                _id: "46a35daa-66df-45b3-81c3-5a93e30d05be",
                name: "Hiwi-Bewerber(in) wird über den Erhalt der Antragseinstellungsunterlagen informiert",
                description:
                    "Hiwi-Bewerber(in) wird über den Erhalt informiert und erhält einen permanenten Link.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "EmailVersenden",
                data: {
                    emailTo: "%%hiwiadmission.$$.email%%",
                    emailSubject:
                        "[NO REPLY] Hiwi-Antragseinstellungsunterlagen für %%hiwiadmission.$$.lecturetitle%% eingegangen",
                    emailContent: `Sehr geehrte(r) %%hiwiadmission.$$.firstname%% %%hiwiadmission.$$.lastname%%,

Ihre Antragseinstellungsunterlagen für eine Hiwi-Stelle für die Veranstaltung %%hiwiadmission.$$.lecturetitle%% sind erfolgreich eingegangen.

Ihre Antragseinstellungsunterlagen können jederzeit unter folgendem Link verändert werden.
https://dekanats-app.uni-heidelberg.de/HiwiAntragseinstellungsunterlagen?id=%%process-manager_workflows.$$._id%%&lecture=%%hiwiadmission.$$.lecturetitle%%

Mit freundlichen Grüßen,
Dekanats-App

Diese E-Mail wurde automatisch erstellt.
Bitte antworten Sie nicht auf diese E-Mail.`,
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "cd02a326-75d8-499a-8dc7-7c23aee2d409",
                name: "Bestätigung der Antragseinstellungsunterlagen",
                description: "Bestätigung der Antragseinstellungsunterlagen auf eine Hiwi-Stelle.",
                type: StepType.Manual,
                trigger: "HIWIBewerbung.BestätigungAntragseinstellungsunterlagen",
                responsible: 0,
                state: ProcessState.NotStarted,
            },
            {
                _id: "10c9db92-d77c-4c00-bf78-fc15e3e3c304",
                name: "Ablehnung der Antragseinstellungsunterlagen",
                description: "Ablehnung der Antragseinstellungsunterlagen auf eine Hiwi-Stelle.",
                type: StepType.Manual,
                trigger: "HIWIBewerbung.AblehnungAntragseinstellungsunterlagen",
                responsible: 0,
                state: ProcessState.NotStarted,
            },
            {
                _id: "224b8674-8e20-45e9-94e2-7c5b4487c0cc",
                name: "Hiwi-Bewerber(in) wird über die Ablehnung der Antragseinstellungsunterlagen informiert",
                description:
                    "Hiwi-Bewerber(in) wird über die Ablehnung der Antragseinstellungsunterlagen informiert.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "EmailVersenden",
                data: {
                    emailTo: "%%hiwiadmission.$$.email%%",
                    emailSubject:
                        "[NO REPLY] Hiwi-Antragseinstellungsunterlagen für %%hiwiadmission.$$.lecturetitle%% abgelehnt",
                    emailContent: `Sehr geehrte(r) %%hiwiadmission.$$.firstname%% %%hiwiadmission.$$.lastname%%,

Ihre Antragseinstellungsunterlagen für eine Hiwi-Stelle für die Veranstaltung %%hiwiadmission.$$.lecturetitle%% wurde leider abgelehnt.
Bitte überprüfen Sie, ob die von Ihnen gemachten Angaben korrekt und vollständig sind.
Sollten Sie Fragen haben, kontaktieren Sie bitte das Studiensekretariat der Fachschaft Mathe und Informatik.

Ihre Antragseinstellungsunterlagen können jederzeit unter folgendem Link verändert werden und erneut abgeschickt werden.
https://dekanats-app.uni-heidelberg.de/HiwiAntragseinstellungsunterlagen?id=%%process-manager_workflows.$$._id%%&lecture=%%hiwiadmission.$$.lecturetitle%%

Mit freundlichen Grüßen,
Dekanats-App

Diese E-Mail wurde automatisch erstellt.
Bitte antworten Sie nicht auf diese E-Mail.`,
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "5ba5a025-7c01-450f-b282-c7d361f0eef9",
                name: "Korrektur der Antragseinstellungsunterlagen",
                description: "Korrektur der Antragseinstellungsunterlagen auf eine Hiwi-Stelle.",
                type: StepType.Manual,
                trigger: "HIWIBewerbung.ÜbermittlungAntragseinstellungsunterlagen",
                responsible: null,
                state: ProcessState.NotStarted,
            },
            {
                _id: "ceeea562-44d1-4d28-a4a3-a9a121c8ca3f",
                name: "Antragseinstellungsunterlagen wurden unterschrieben",
                description:
                    "Antragseinstellungsunterlagen wurden von der Uni-Verwaltung unterschrieben.",
                type: StepType.Manual,
                trigger: "HIWIBewerbung.AntragseinstellungsunterlagenUnterschrieben",
                responsible: 0,
                state: ProcessState.NotStarted,
            },
            {
                _id: "39fb51aa-c8c8-4410-a2dd-57aaed810aff",
                name: "Antragseinstellungsunterlagen wurden nicht unterschrieben",
                description:
                    "Antragseinstellungsunterlagen wurden von der Uni-Verwaltung nicht unterschrieben.",
                type: StepType.Manual,
                trigger: "HIWIBewerbung.AntragseinstellungsunterlagenNichtUnterschrieben",
                responsible: 0,
                state: ProcessState.NotStarted,
            },
            {
                _id: "d4708beb-1766-470c-bc3f-3fb5da6da11c",
                name: "Hiwi-Bewerber(in) wird über die endgültige Ablehnung informiert",
                description: "Hiwi-Bewerber(in) wird über die endgültige Ablehnung informiert.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "EmailVersenden",
                data: {
                    emailTo: "%%hiwiadmission.$$.email%%",
                    emailSubject:
                        "[NO REPLY] Bewerbung auf Hiwi-Stelle für %%hiwiadmission.$$.lecturetitle%% abgelehnt",
                    emailContent: `Sehr geehrte(r) %%hiwiadmission.$$.firstname%% %%hiwiadmission.$$.lastname%%,

Ihre Bewerbung auf eine Hiwi-Stelle für die Veranstaltung %%hiwiadmission.$$.lecturetitle%% wurde leider abgelehnt.
Sollten Sie Fragen haben, kontaktieren Sie bitte das Studiensekretariat der Fachschaft Mathe und Informatik.

Mit freundlichen Grüßen,
Dekanats-App

Diese E-Mail wurde automatisch erstellt.
Bitte antworten Sie nicht auf diese E-Mail.`,
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "d1f5e269-a717-488b-b34e-4674f77ec73b",
                name: "Hiwi-Bewerber(in) wird über die endgültige Ablehnung informiert",
                description: "Hiwi-Bewerber(in) wird über die endgültige Ablehnung informiert.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "EmailVersenden",
                data: {
                    emailTo: "central.university.administration@uni-heidelberg.de",
                    emailSubject:
                        "[NO REPLY] Bewerbung auf Hiwi-Stelle für %%hiwiadmission.$$.lecturetitle%% akzeptiert",
                    emailContent: `Sehr geehrte Damen und Herren der zentralen Universitätsverwaltung,

Die folgende Bewerbung auf eine Hiwi-Stelle im Fachbereich Mathe und Informatik war erfolgreich:
Vorname: %%hiwiadmission.$$.firstname%%
Nachname: %%hiwiadmission.$$.lastname%%
E-mail: %%hiwiadmission.$$.email%%

Bitte kontaktieren Sie das Studiensekretariat der Fachschaft Mathe und Informatik für alle Unterlagen.

Mit freundlichen Grüßen,
Dekanats-App

Diese E-Mail wurde automatisch erstellt.
Bitte antworten Sie nicht auf diese E-Mail.`,
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "e3819d6c-f44f-47c5-bd7d-4aef486cd2af",
                name: "Prüfe, ob Hiwi bereits vereidigt wurde",
                description: "Prüfe, ob Hiwi-Anwärter(in) bereits vereidigt wurde.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "GegenKonstantePrüfen",
                data: {
                    operator: "==",
                    tableName: "hiwiadmission",
                    columnName: "swornIn",
                    rowId: "$$",
                    constant: "Ja",
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "8913e512-b462-415c-bde8-52b5e0c9dbcc",
                name: "Hiwi-Bewerber(in) wird über die Einstellung informiert",
                description: "Hiwi-Bewerber(in) wird über die Einstellung als Hiwi informiert.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "EmailVersenden",
                data: {
                    emailTo: "%%hiwiadmission.$$.email%%",
                    emailSubject:
                        "[NO REPLY] Bewerbung auf Hiwi-Stelle für %%hiwiadmission.$$.lecturetitle%% erfolgreich",
                    emailContent: `Sehr geehrte(r) %%hiwiadmission.$$.firstname%% %%hiwiadmission.$$.lastname%%,

Ihre Bewerbung auf eine Hiwi-Stelle für die Veranstaltung %%hiwiadmission.$$.lecturetitle%% war erfolgreich!

Mit freundlichen Grüßen,
Dekanats-App

Diese E-Mail wurde automatisch erstellt.
Bitte antworten Sie nicht auf diese E-Mail.`,
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "e8ffd4a0-1810-40e3-ab95-d40b767e006f",
                name: "Festlegung Vereidigungstermin",
                description:
                    "Der Ort und Zeitpunkt der Vereidigung wird für den/die Bewerber(in) festgelegt.",
                type: StepType.Manual,
                trigger: "HIWIBewerbung.VereidigungFestgelegt",
                responsible: 0,
                state: ProcessState.NotStarted,
            },
            {
                _id: "ec685792-68db-42b3-beca-1ebdfd082678",
                name: "Hiwi-Bewerber(in) wird über die Vereidigung informiert",
                description:
                    "Hiwi-Bewerber(in) wird über den Ort und den Zeitpunkt der Vereidigung informiert.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "EmailVersenden",
                data: {
                    emailTo: "%%hiwiadmission.$$.email%%",
                    emailSubject:
                        "[NO REPLY] Vereidigung auf Hiwi-Stelle für %%hiwiadmission.$$.lecturetitle%% erfolgreich",
                    emailContent: `Sehr geehrte(r) %%hiwiadmission.$$.firstname%% %%hiwiadmission.$$.lastname%%,

Ihre Bewerbung auf eine Hiwi-Stelle für die Veranstaltung %%hiwiadmission.$$.lecturetitle%% erfordert Ihre Vereidigung!
Ort: %%hiwiadmission.$$.swornPlace%%
Zeit: %%hiwiadmission.$$.swornDate%%

Sollten Sie Fragen haben, kontaktieren Sie bitte das Studiensekretariat der Fachschaft Mathe und Informatik.

Mit freundlichen Grüßen,
Dekanats-App

Diese E-Mail wurde automatisch erstellt.
Bitte antworten Sie nicht auf diese E-Mail.`,
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "e28a47cc-c566-47c1-87fb-5d14df6dbc77",
                name: "Prüfe, ob Hiwi bei Vereidigung vereidigt wurde",
                description: "Prüfe, ob Hiwi-Anwärter(in) bei Vereidigung vereidigt wurde.",
                type: StepType.Automatic,
                delay: {
                    value: 2,
                    unit: TimeUnit.Days,
                },
                trigger: "GegenKonstantePrüfen",
                data: {
                    operator: "==",
                    tableName: "hiwiadmission",
                    columnName: "swornIn",
                    rowId: "$$",
                    constant: "Ja",
                },
                state: ProcessState.NotStarted,
            },
            {
                _id: "9e64bd59-24fa-4f2b-b509-319917ebded6",
                name: "Prüfe, ob Hiwi bei Vereidigung nicht vereidigt wurde",
                description: "Prüfe, ob Hiwi-Anwärter(in) bei Vereidigung nicht vereidigt wurde.",
                type: StepType.Automatic,
                delay: {
                    value: 0,
                    unit: TimeUnit.Minutes,
                },
                trigger: "GegenKonstantePrüfen",
                data: {
                    operator: "==",
                    tableName: "hiwiadmission",
                    columnName: "swornIn",
                    rowId: "$$",
                    constant: "Nein",
                },
                state: ProcessState.NotStarted,
            },
        ]),
        connections: JSON.stringify({
            "6c725c4f-1304-463a-99c0-fd0b5b42a11a": ["7a568b13-8a9a-49b1-8bda-e4bf44afdb12"],
            "7a568b13-8a9a-49b1-8bda-e4bf44afdb12": ["4ace63f4-3efc-417b-b7bf-0e1363fb79ea"],
            "4ace63f4-3efc-417b-b7bf-0e1363fb79ea": [
                "36e286f4-3ec1-4f9d-9a38-349f21a8a7ac",
                "e8c9b934-9969-436f-9837-be8256ef7126",
            ],
            "e8c9b934-9969-436f-9837-be8256ef7126": ["a5baf34d-0f4a-497c-98a1-62666bef7402"],
            "a5baf34d-0f4a-497c-98a1-62666bef7402": ["77187c7f-6134-413c-b40a-9f307cba6905"],
            "77187c7f-6134-413c-b40a-9f307cba6905": ["4ace63f4-3efc-417b-b7bf-0e1363fb79ea"],
            "36e286f4-3ec1-4f9d-9a38-349f21a8a7ac": ["0c043b94-b441-4b5b-85f4-83198c434080"],
            "0c043b94-b441-4b5b-85f4-83198c434080": ["4a9c9d6a-5134-4279-bcbb-377d97de9b41"],
            "4a9c9d6a-5134-4279-bcbb-377d97de9b41": ["46a35daa-66df-45b3-81c3-5a93e30d05be"],
            "46a35daa-66df-45b3-81c3-5a93e30d05be": [
                "cd02a326-75d8-499a-8dc7-7c23aee2d409",
                "10c9db92-d77c-4c00-bf78-fc15e3e3c304",
            ],
            "10c9db92-d77c-4c00-bf78-fc15e3e3c304": ["224b8674-8e20-45e9-94e2-7c5b4487c0cc"],
            "224b8674-8e20-45e9-94e2-7c5b4487c0cc": ["5ba5a025-7c01-450f-b282-c7d361f0eef9"],
            "5ba5a025-7c01-450f-b282-c7d361f0eef9": ["46a35daa-66df-45b3-81c3-5a93e30d05be"],
            "cd02a326-75d8-499a-8dc7-7c23aee2d409": [
                "ceeea562-44d1-4d28-a4a3-a9a121c8ca3f",
                "39fb51aa-c8c8-4410-a2dd-57aaed810aff",
            ],
            "ceeea562-44d1-4d28-a4a3-a9a121c8ca3f": ["d1f5e269-a717-488b-b34e-4674f77ec73b"],
            "39fb51aa-c8c8-4410-a2dd-57aaed810aff": ["d4708beb-1766-470c-bc3f-3fb5da6da11c"],
            "d1f5e269-a717-488b-b34e-4674f77ec73b": ["e3819d6c-f44f-47c5-bd7d-4aef486cd2af"],
            "e3819d6c-f44f-47c5-bd7d-4aef486cd2af": [
                "8913e512-b462-415c-bde8-52b5e0c9dbcc",
                "e8ffd4a0-1810-40e3-ab95-d40b767e006f",
            ],
            "e8ffd4a0-1810-40e3-ab95-d40b767e006f": ["e28a47cc-c566-47c1-87fb-5d14df6dbc77"],
            "e28a47cc-c566-47c1-87fb-5d14df6dbc77": [
                "8913e512-b462-415c-bde8-52b5e0c9dbcc",
                "9e64bd59-24fa-4f2b-b509-319917ebded6",
            ],
            "9e64bd59-24fa-4f2b-b509-319917ebded6": [
                "d4708beb-1766-470c-bc3f-3fb5da6da11c",
                "e28a47cc-c566-47c1-87fb-5d14df6dbc77",
            ],
        }),
        startstep: "6c725c4f-1304-463a-99c0-fd0b5b42a11a",
        history: JSON.stringify([]),
        owner: 0,
        state: ProcessState.Pending,
        majorsteps: JSON.stringify([
            "6c725c4f-1304-463a-99c0-fd0b5b42a11a", // HIWIBewerbung.ÜbermittlungBewerbungsformular
            "36e286f4-3ec1-4f9d-9a38-349f21a8a7ac", // HIWIBewerbung.BestätigungBewerbungsformular
            "4a9c9d6a-5134-4279-bcbb-377d97de9b41", // HIWIBewerbung.ÜbermittlungAntragseinstellungsunterlagen
            "cd02a326-75d8-499a-8dc7-7c23aee2d409", // HIWIBewerbung.BestätigungAntragseinstellungsunterlagen
            "8913e512-b462-415c-bde8-52b5e0c9dbcc", // EmailVersenden - Hiwi Bewerber(in) wird über die Einstellung informiert
        ]),
    },
]

const AUTOMATIC_STEP_TEMPLATE_DATA: AutomaticStepTemplate[] = [
    {
        _id: "EmailVersenden",
        index: 0,
        trigger: "EmailVersenden",
        data: {
            emailTo: {
                name: "Empfänger",
                required: true,
            },
            emailSubject: {
                name: "Betreff",
                required: true,
            },
            emailContent: {
                name: "Inhalt",
                required: true,
                multiline: true,
            },
        },
        helptext: `E-mails können mit Daten aus der Datenbank versehen werden.
    Hierzu werden Platzhalter verwendet. Diese können wie folgt verwendet werden:
    %%TabellenName.Reihenidentifikator.Spaltenname%%
    
    Reihenidentifikator-Spezialfall "$$":
    Hierbei wird die Prozess-ID des laufenden Prozesses eingefügt.

    Beispiel:
    Empfänger: %%personen.$$.email%%`,
    },
    {
        _id: "EmailVerspätetVersenden",
        index: 1,
        trigger: "EmailVerspätetVersenden",
        data: {
            emailTo: {
                name: "Empfänger",
                required: true,
            },
            emailSubject: {
                name: "Betreff",
                required: true,
            },
            emailContent: {
                name: "Inhalt",
                required: true,
                multiline: true,
            },
            date: {
                name: "Datum der Zustellung",
                helpText:
                    "Falls das Datum in der Vergangenheit liegt, wird die E-Mail direkt versendet.",
                required: true,
                type: "datetime-local",
            },
        },
        helptext: `E-mails können mit Daten aus der Datenbank versehen werden.
    Hierzu werden Platzhalter verwendet. Diese können wie folgt verwendet werden:
    %%TabellenName.Reihenidentifikator.Spaltenname%%
    
    Reihenidentifikator-Spezialfall "$$":
    Hierbei wird die Prozess-ID des laufenden Prozesses eingefügt.

    Beispiel:
    Empfänger: %%personen.$$.email%%
    
    E-mails und deren Platzhalter werden zum Zeitpunkt des Sendens generiert.`,
    },
    {
        _id: "ProzessInfosVerändern",
        index: 2,
        trigger: "ProzessInfosVerändern",
        data: {
            name: {
                name: "Prozessname",
            },
            description: {
                name: "Prozessbeschreibung",
            },
        },
        helptext: `Prozess-Infos können zusätzlich mit Daten aus der Datenbank versehen werden.
    Hierzu werden Platzhalter verwendet. Diese können wie folgt verwendet werden:
    %%TabellenName.Reihenidentifikator.Spaltenname%%
    
    Reihenidentifikator-Spezialfall "$$":
    Hierbei wird die Prozess-ID des laufenden Prozesses eingefügt.

    Beispiel: "Prozess XY - %%personen.$$.lastname%%"`,
    },
    {
        _id: "GegenKonstantePrüfen",
        index: 3,
        trigger: "GegenKonstantePrüfen",
        data: {
            operator: {
                name: "Vergleichsoperator",
                helpText: "Erlaubte Operatoren: ==, !=, >, <, >=, <=",
                required: true,
            },
            tableName: {
                name: "Tabellenname",
                required: true,
            },
            columnName: {
                name: "Spaltenname",
                required: true,
            },
            rowId: {
                name: "Reihen Identifikator",
                helpText: "$$ -> Diese Prozess ID",
                required: true,
            },
            constant: {
                name: "Konstante",
            },
        },
        helptext: `Ein Test hat drei mögliche Ausgänge.
    Ein positives Ergebnis: Der erste Schritt in den Verbindungen wird hiernach ausgeführt.
    Ein negatives Ergebnis: Der zweite Schritt in den Verbindungen wird hiernach ausgeführt.
    Das Prüfen schlug fehl: Der dritte Schritt in den Verbindungen wird hiernach ausgeführt.`,
    },
    {
        _id: "GegenTabellenwertPrüfen",
        index: 4,
        trigger: "GegenTabellenwertPrüfen",
        data: {
            operator: {
                name: "Vergleichsoperator",
                helpText: "Erlaubte Operatoren: ==, !=, >, <, >=, <=",
                required: true,
            },
            tableName1: {
                name: "Tabellenname der ersten Tabelle",
                required: true,
            },
            columnName1: {
                name: "Spaltenname der ersten Tabelle",
                required: true,
            },
            rowId1: {
                name: "Reihen-Identifikator der ersten Tabelle",
                helpText: "$$ -> Diese Prozess ID",
                required: true,
            },
            tableName2: {
                name: "Tabellenname der zweiten Tabelle",
                required: true,
            },
            columnName2: {
                name: "Spaltenname der zweiten Tabelle",
                required: true,
            },
            rowId2: {
                name: "Reihen-Identifikator der zweiten Tabelle",
                helpText: "$$ -> Diese Prozess ID",
                required: true,
            },
        },
        helptext: `Ein Test hat drei mögliche Ausgänge.
    Ein positives Ergebnis: Der erste Schritt in den Verbindungen wird hiernach ausgeführt.
    Ein negatives Ergebnis: Der zweite Schritt in den Verbindungen wird hiernach ausgeführt.
    Das Prüfen schlug fehl: Der dritte Schritt in den Verbindungen wird hiernach ausgeführt.`,
    },
    {
        _id: "KonstanteInTabelleSchreiben",
        index: 5,
        trigger: "KonstanteInTabelleSchreiben",
        data: {
            tableName: {
                name: "Tabellenname",
                required: true,
            },
            columnName: {
                name: "Spaltenname",
                required: true,
            },
            rowId: {
                name: "Reihen-Identifikator",
                helpText: "$$ -> Diese Prozess ID",
                required: true,
            },
            constant: {
                name: "Konstante",
            },
        },
        helptext: "",
    },
    {
        _id: "TabellenwertKopieren",
        index: 6,
        trigger: "TabellenwertKopieren",
        data: {
            tableNameS: {
                name: "Tabellenname der ersten Tabelle",
                helpText: "Tabelle aus der kopiert wird",
                required: true,
            },
            columnNameS: {
                name: "Spaltenname der ersten Tabelle",
                required: true,
            },
            rowIdS: {
                name: "Reihen-Identifikator der ersten Tabelle",
                helpText: "$$ -> Diese Prozess ID",
                required: true,
            },
            tableNameT: {
                name: "Tabellenname der zweiten Tabelle",
                helpText: "Tabelle in die kopiert wird",
                required: true,
            },
            columnNameT: {
                name: "Spaltenname der zweiten Tabelle",
                required: true,
            },
            rowIdT: {
                name: "Reihen-Identifikator der zweiten Tabelle",
                helpText: "$$ -> Diese Prozess ID",
                required: true,
            },
        },
        helptext: "",
    },
    {
        _id: "TabelleErstellen",
        index: 7,
        trigger: "TabelleErstellen",
        data: {
            tableName: {
                name: "Tabellenname",
                required: true,
            },
        },
        helptext: "Eine Tabelle wird mit den Standard-Spalten _id und index erstellt.",
    },
    {
        _id: "TabelleUmbenennen",
        index: 8,
        trigger: "TabelleUmbenennen",
        data: {
            oldTableName: {
                name: "Alter Tabellenname",
                required: true,
            },
            newTableName: {
                name: "Neuer Tabellenname",
                required: true,
            },
        },
        helptext:
            "Bei dieser Aktion ist Vorsicht geboten, um nicht versehentlich eine systemrelevante Tabelle umzubenennen.",
    },
    {
        _id: "TabelleLöschen",
        index: 9,
        trigger: "TabelleLöschen",
        data: {
            tableName: {
                name: "Tabellenname",
                required: true,
            },
        },
        helptext:
            "Bei dieser Aktion ist Vorsicht geboten, um nicht versehentlich eine systemrelevante Tabelle zu löschen.",
    },
    {
        _id: "SpalteHinzufügen",
        index: 10,
        trigger: "SpalteHinzufügen",
        data: {
            tableName: {
                name: "Tabellenname",
                required: true,
            },
            columnName: {
                name: "Spaltenname",
                required: true,
            },
            columnType: {
                name: "Spaltentyp",
                helpText:
                    "Eine Liste aller erlaubten Spaltentypen befindet sich im Nutzerhandbuch der Prozesse.",
                required: true,
            },
            columnOptions: {
                name: "Spaltenoptionen",
                helpText:
                    "Eine Liste aller erlaubten Spaltenoptionen befindet sich im Nutzerhandbuch der Prozesse.",
                required: true,
            },
        },
        helptext: `Mehrere Spaltenoptionen können mit einem Semikolon getrennt werden.

    Sollte keine Tabelle mit dem angegebenen Namen existieren, dann wird diese erstellt.`,
    },
    {
        _id: "SpalteUmbenennen",
        index: 11,
        trigger: "SpalteUmbenennen",
        data: {
            tableName: {
                name: "Tabellenname",
                required: true,
            },
            oldColumnName: {
                name: "Alter Spaltenname",
                required: true,
            },
            newColumnName: {
                name: "Neuer Spaltenname",
                required: true,
            },
        },
        helptext:
            "Bei dieser Aktion ist Vorsicht geboten, um nicht versehentlich eine systemrelevante Spalte umzubenennen.",
    },
    {
        _id: "SpalteLöschen",
        index: 12,
        trigger: "SpalteLöschen",
        data: {
            tableName: {
                name: "Tabellenname",
                required: true,
            },
            columnName: {
                name: "Spaltenname",
                required: true,
            },
        },
        helptext:
            "Bei dieser Aktion ist Vorsicht geboten, um nicht versehentlich eine systemrelevante Spalte zu löschen.",
    },
    {
        _id: "ProzessReiheHinzufügen",
        index: 13,
        trigger: "ProzessReiheHinzufügen",
        data: {
            tableName: {
                name: "Tabellenname",
                required: true,
            },
        },
        helptext: `Fügt eine neue Reihe mit der Prozess-ID als _id der Tabelle hinzu.

    Sollte keine Tabelle mit dem angegebenen Namen existieren, dann wird diese erstellt.`,
    },
    {
        _id: "ProzessReiheLöschen",
        index: 14,
        trigger: "ProzessReiheLöschen",
        data: {
            tableName: {
                name: "Tabellenname",
                required: true,
            },
        },
        helptext: "Löscht die Reihe mit der Prozess-ID als _id.",
    },
    {
        _id: "TabellenWertErhöhen",
        index: 15,
        trigger: "TabellenWertErhöhen",
        data: {
            tableName: {
                name: "Tabellenname",
                required: true,
            },
            columnName: {
                name: "Spaltenname",
                required: true,
            },
            rowId: {
                name: "Reihen-Identifikator",
                helpText: "$$ -> Diese Prozess ID",
                required: true,
            },
            constant: {
                name: "Konstante",
                required: true,
            },
        },
        helptext: `Erhöht den Tabellenwert um die Konstante.
    Dieser Schritt ist für iterative Schleifen nützlich.`,
    },
    {
        _id: "TabellenWertVerringern",
        index: 16,
        trigger: "TabellenWertVerringern",
        data: {
            tableName: {
                name: "Tabellenname",
                required: true,
            },
            columnName: {
                name: "Spaltenname",
                required: true,
            },
            rowId: {
                name: "Reihen-Identifikator",
                helpText: "$$ -> Diese Prozess ID",
                required: true,
            },
            constant: {
                name: "Konstante",
                required: true,
            },
        },
        helptext: `Verringert den Tabellenwert um die Konstante.
    Dieser Schritt ist für iterative Schleifen nützlich.`,
    },
    {
        _id: "PrüfeObSpalteExistiert",
        index: 17,
        trigger: "PrüfeObSpalteExistiert",
        data: {
            tableName: {
                name: "Tabellenname",
                required: true,
            },
            columnName: {
                name: "Spaltenname",
                required: true,
            },
        },
        helptext: "Schlägt auch fehl, sollte die Tabelle nicht existieren",
    },
    {
        _id: "PrüfeObTabelleExistiert",
        index: 18,
        trigger: "PrüfeObSpalteExistiert",
        data: {
            tableName: {
                name: "Tabellenname",
                required: true,
            },
        },
        helptext: "",
    },
]

const AUTOMATIC_STEP_TEMPLATES: Column[] = [
    {
        name: "_id",
        type: ColumnType.string,
    },
    {
        name: "index",
        type: ColumnType.integer,
    },
    {
        name: "trigger",
        type: ColumnType.string,
    },
    {
        name: "data",
        type: ColumnType.text,
    },
    {
        name: "helptext",
        type: ColumnType.text,
    },
]

const JOBS: Column[] = [
    {
        name: "_id",
        type: ColumnType.string,
    },
    {
        name: "index",
        type: ColumnType.integer,
    },
    {
        name: "name",
        type: ColumnType.string,
    },
    {
        name: "deadline",
        type: ColumnType.bigInteger,
    },
    {
        name: "workflowId",
        type: ColumnType.string,
    },
    {
        name: "autoaction",
        type: ColumnType.string,
    },
    {
        name: "stepData",
        type: ColumnType.text,
    },
    {
        name: "state",
        type: ColumnType.string,
    },
]

export const allTables: Record<string, { schema: Column[]; data?: unknown[] }> = {
    [tableNames.workflows]: {
        schema: WORKFLOWS,
        data: WORKFLOW_DATA,
    },
    [tableNames.automatic_steps]: {
        schema: AUTOMATIC_STEP_TEMPLATES,
        data: AUTOMATIC_STEP_TEMPLATE_DATA,
    },
    [tableNames.jobs]: {
        schema: JOBS,
    },
}
