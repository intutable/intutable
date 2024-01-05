import { v4 as uuidv4 } from "uuid"
import { PluginLoader } from "@intutable-org/core"
import {
    openConnection,
    closeConnection,
    select,
    update,
    createTable,
    addColumn,
    insert,
    deleteTable,
    renameTable,
    renameColumn,
    deleteRow,
    deleteColumn,
} from "@intutable-org/database/dist/requests"
import { ProcessState, Step, Workflow } from "../types"
import { USERNAME, PASSWORD } from "../config/connection"
import { selectWorkflows, updateWorkflow } from "../data/InternalTableAccess"
import { createJob } from "../jobs/JobScheduler"
import { triggerNextAction } from "./WorkflowManager"
import { Column, ColumnType, SimpleColumnOption } from "@intutable-org/database/dist/types"
import { MailOptions } from "@intutable-org/mail-plugin/dist/types"
import { sendMail } from "@intutable-org/mail-plugin/dist/requests"

function formatRowData(data: unknown, offset?: string): string {
    if (typeof data === "string") {
        try {
            return formatRowData(JSON.parse(data))
        } catch (error) {
            return data || ""
        }
    }

    if (typeof data === "number" || typeof data === "boolean") {
        return data + ""
    }

    if (Array.isArray(data)) {
        return data.reduce(
            (combinedString, dataPart) =>
                combinedString +
                ` - ${formatRowData(dataPart, `${offset || ""}   `)}
        ${offset || ""}`,
            ""
        )
    }

    if (typeof data === "object" && data !== null) {
        return Object.keys(data).reduce(
            (combinedString, key) =>
                combinedString +
                `${key}: ${formatRowData(data[key as keyof unknown], `${offset || ""}   `)}
        ${offset || ""}`,
            ""
        )
    }

    return ""
}

async function replacePlaceholders(texts: string[], workflowId: string): Promise<string[]> {
    const variableMap = new Map<string, string>()

    const dataToFetch: Record<string, Record<string, Record<string, string>>> = {}

    texts.forEach(text => {
        // gather variables from text
        const textParts: string[] = text.split("%%")
        textParts.forEach((textPart: string, index: number) => {
            if (index % 2 !== 0 && !variableMap.has(textPart)) {
                const path: string[] = textPart.split(".")
                const tableName = path[0]
                const rowId = path[1]
                const columnName = path[2]

                if (!dataToFetch[tableName]) {
                    dataToFetch[tableName] = {}
                }

                if (!dataToFetch[tableName][rowId]) {
                    dataToFetch[tableName][rowId] = {}
                }

                if (!dataToFetch[tableName][rowId][columnName]) {
                    dataToFetch[tableName][rowId][columnName] = ""
                }
                variableMap.set(textPart, "")
            }
        })
    })

    // gather required data from tables
    if (Object.keys(dataToFetch).length) {
        let connectionId = ""

        for (const tableName of Object.keys(dataToFetch)) {
            for (const rowId of Object.keys(dataToFetch[tableName])) {
                if (dataToFetch[tableName][rowId]._id) {
                    // we already know the id and do not need to fetch it.
                    delete dataToFetch[tableName][rowId]._id
                    const key = [tableName, rowId, "_id"].join(".")
                    variableMap.set(key, rowId === "$$" ? workflowId : rowId)
                }

                if (Object.keys(dataToFetch[tableName][rowId]).length) {
                    if (!connectionId) {
                        // Only open the connection if it is necessary and only open it once
                        connectionId = await core.events
                            .request(openConnection(USERNAME, PASSWORD))
                            .then(({ connectionId }) => connectionId)
                    }
                    const rowData = ((
                        await core.events.request(
                            select(connectionId, tableName, {
                                condition: ["_id", rowId === "$$" ? workflowId : rowId],
                                columns: Object.keys(dataToFetch[tableName][rowId]),
                            })
                        )
                    )[0] || {}) as Record<string, unknown>

                    Object.keys(dataToFetch[tableName][rowId]).forEach((columnName: string) => {
                        const key = [tableName, rowId, columnName].join(".")
                        let value = ""

                        if (rowData[columnName]) {
                            value = formatRowData(rowData[columnName])
                        }

                        variableMap.set(key, value)
                    })
                }
            }
        }

        if (connectionId) {
            await core.events.request(closeConnection(connectionId))
        }
    }

    return texts.map(text => {
        for (const [key, value] of Array.from(variableMap.entries())) {
            // replace variables in text with data from table
            let oldText = ""
            while (text !== oldText) {
                oldText = text
                text = text.replace(`%%${key}%%`, `${value}`)
            }
        }

        return text
    })
}

function convertToNumber(value: unknown): number {
    if (value === "true" || value === true) {
        return 1
    }

    if (value === null || value === "" || value === undefined) {
        return 0
    }

    if (typeof value === "string") {
        return parseFloat(value)
    }

    return value as number
}

function compareValues(operator: string, value1: unknown, value2: unknown): number {
    const v1 = convertToNumber(value1)
    const v2 = convertToNumber(value2)
    switch (operator) {
        case "<":
            return v1 < v2 ? 0 : 1
        case "<=":
            return v1 <= v2 ? 0 : 1
        case ">":
            return v1 > v2 ? 0 : 1
        case ">=":
            return v1 >= v2 ? 0 : 1
        case "==":
            return value1 === value2 ? 0 : 1
        case "!=":
            return value1 !== value2 ? 0 : 1
        default:
            return 2
    }
}

async function createNewTable(connectionId: string, tableName: string) {
    const columns: Column[] = [
        {
            name: "_id",
            type: ColumnType.string,
            options: [SimpleColumnOption.primary],
        },
        {
            name: "index",
            type: ColumnType.increments,
            options: [SimpleColumnOption.index],
        },
    ]

    await core.events.request(createTable(connectionId, tableName, columns))
}

let core: PluginLoader

export function initAutomaticSteps(_core: PluginLoader) {
    core = _core
}

export const AutomaticSteps: Record<
    string,
    (
        workflowId: string,
        stepData: Record<string, string | number>
    ) => Promise<{ decision?: number }>
> = {
    EmailVersenden: async function (workflowId, stepData) {
        if (
            stepData.emailTo &&
            typeof stepData.emailTo === "string" &&
            stepData.emailSubject &&
            typeof stepData.emailSubject === "string" &&
            stepData.emailContent &&
            typeof stepData.emailContent === "string"
        ) {
            const [emailTo, emailSubject, emailContent]: string[] = await replacePlaceholders(
                [stepData.emailTo, stepData.emailSubject, stepData.emailContent],
                workflowId
            )

            const mailOptions: MailOptions = {
                to: emailTo,
                subject: emailSubject,
                text: emailContent,
            }

            await core.events.request(sendMail(mailOptions))
        }
        return Promise.resolve({})
    },

    EmailVerspätetVersenden: async function (workflowId, stepData) {
        if (
            stepData.emailTo &&
            typeof stepData.emailTo === "string" &&
            stepData.emailSubject &&
            typeof stepData.emailSubject === "string" &&
            stepData.emailContent &&
            typeof stepData.emailContent === "string" &&
            stepData.date &&
            typeof stepData.date === "number"
        ) {
            await createJob({
                _id: uuidv4(),
                name: `EmailVerspätetVersenden_${stepData.emailSubject}`,
                deadline: stepData.date,
                workflowId: workflowId,
                autoaction: "EmailVersenden",
                stepData: stepData,
                state: ProcessState.Pending,
            })
        }

        return Promise.resolve({})
    },

    ProzessInfosVerändern: async function (workflowId, stepData) {
        if (
            (stepData.name && typeof stepData.name === "string") ||
            (stepData.description && typeof stepData.description === "string")
        ) {
            const updateData: Record<string, unknown> = {}

            const [newName, newDescription]: string[] = await replacePlaceholders(
                [(stepData.name as string) || "", (stepData.description as string) || ""],
                workflowId
            )

            if (newName) {
                updateData.name = newName
            }

            if (newDescription) {
                updateData.description = newDescription
            }

            await updateWorkflow(updateData, ["_id", workflowId])
        }

        return Promise.resolve({})
    },

    runDelayedAction: async function (workflowId, stepData) {
        const workflow: Workflow | undefined = (
            await selectWorkflows({
                condition: ["_id", workflowId],
            })
        )[0]

        if (workflow) {
            const currentStep: Step | undefined = workflow.steps.filter(
                (step: Step) => step._id === stepData.stepId
            )[0]

            if (currentStep) {
                const result = await AutomaticSteps[currentStep.trigger](
                    workflow._id,
                    currentStep.data || {}
                )

                let decision
                if (result.decision !== undefined) {
                    decision = result.decision
                }

                currentStep.state = ProcessState.Completed
                workflow.history[workflow.history.length - 1].completedat = Date.now()

                await triggerNextAction(workflow, currentStep._id, decision)
            }
        }

        return Promise.resolve({})
    },

    GegenKonstantePrüfen: async function (workflowId, stepData) {
        let decision = 2

        if (
            stepData.operator &&
            typeof stepData.operator === "string" &&
            stepData.tableName &&
            typeof stepData.tableName === "string" &&
            stepData.columnName &&
            typeof stepData.columnName === "string" &&
            stepData.rowId &&
            typeof stepData.rowId === "string"
        ) {
            const connectionId = await core.events
                .request(openConnection(USERNAME, PASSWORD))
                .then(({ connectionId }) => connectionId)

            const rowData = ((
                await core.events.request(
                    select(connectionId, stepData.tableName, {
                        condition: ["_id", stepData.rowId1 === "$$" ? workflowId : stepData.rowId1],
                        columns: [stepData.columnName],
                    })
                )
            )[0] || {}) as Record<string, unknown>

            await core.events.request(closeConnection(connectionId))

            decision = compareValues(
                stepData.operator,
                rowData[stepData.columnName],
                stepData.constant
            )
        }

        return Promise.resolve({
            decision: decision,
        })
    },

    GegenTabellenwertPrüfen: async function (workflowId, stepData) {
        let decision = 2

        if (
            stepData.operator &&
            typeof stepData.operator === "string" &&
            stepData.tableName1 &&
            typeof stepData.tableName1 === "string" &&
            stepData.columnName1 &&
            typeof stepData.columnName1 === "string" &&
            stepData.rowId1 &&
            typeof stepData.rowId1 === "string" &&
            stepData.tableName2 &&
            typeof stepData.tableName2 === "string" &&
            stepData.columnName2 &&
            typeof stepData.columnName2 === "string" &&
            stepData.rowId2 &&
            typeof stepData.rowId2 === "string"
        ) {
            const connectionId = await core.events
                .request(openConnection(USERNAME, PASSWORD))
                .then(({ connectionId }) => connectionId)

            const rowData1 = ((
                await core.events.request(
                    select(connectionId, stepData.tableName1, {
                        condition: ["_id", stepData.rowId1 === "$$" ? workflowId : stepData.rowId1],
                        columns: [stepData.columnName1],
                    })
                )
            )[0] || {}) as Record<string, unknown>

            const rowData2 = ((
                await core.events.request(
                    select(connectionId, stepData.tableName2, {
                        condition: ["_id", stepData.rowId2 === "$$" ? workflowId : stepData.rowId2],
                        columns: [stepData.columnName2],
                    })
                )
            )[0] || {}) as Record<string, unknown>

            await core.events.request(closeConnection(connectionId))

            decision = compareValues(
                stepData.operator,
                rowData1[stepData.columnName1],
                rowData2[stepData.columnName2]
            )
        }

        return Promise.resolve({
            decision: decision,
        })
    },

    KonstanteInTabelleSchreiben: async function (workflowId, stepData) {
        if (
            stepData.tableName &&
            typeof stepData.tableName === "string" &&
            stepData.columnName &&
            typeof stepData.columnName === "string" &&
            stepData.rowId &&
            typeof stepData.rowId === "string"
        ) {
            const connectionId = await core.events
                .request(openConnection(USERNAME, PASSWORD))
                .then(({ connectionId }) => connectionId)

            const updateData: Record<string, unknown> = {}
            updateData[stepData.columnName] = stepData.constant
            await core.events.request(
                update(connectionId, stepData.tableName, {
                    update: updateData,
                    condition: ["_id", stepData.rowId === "$$" ? workflowId : stepData.rowId],
                })
            )

            await core.events.request(closeConnection(connectionId))
        }

        return Promise.resolve({})
    },

    TabellenwertKopieren: async function (workflowId, stepData) {
        if (
            stepData.tableNameS &&
            typeof stepData.tableNameS === "string" &&
            stepData.columnNameS &&
            typeof stepData.columnNameS === "string" &&
            stepData.rowIdS &&
            typeof stepData.rowIdS === "string" &&
            stepData.tableNameT &&
            typeof stepData.tableNameT === "string" &&
            stepData.columnNameT &&
            typeof stepData.columnNameT === "string" &&
            stepData.rowIdT &&
            typeof stepData.rowIdT === "string"
        ) {
            const connectionId = await core.events
                .request(openConnection(USERNAME, PASSWORD))
                .then(({ connectionId }) => connectionId)

            const rowDataS = ((
                await core.events.request(
                    select(connectionId, stepData.tableNameS, {
                        condition: ["_id", stepData.rowIdS === "$$" ? workflowId : stepData.rowIdS],
                        columns: [stepData.columnNameS],
                    })
                )
            )[0] || {}) as Record<string, unknown>

            const updateData: Record<string, unknown> = {}
            updateData[stepData.columnNameT] = rowDataS[stepData.columnNameS]
            await core.events.request(
                update(connectionId, stepData.tableNameT, {
                    update: updateData,
                    condition: ["_id", stepData.rowIdT === "$$" ? workflowId : stepData.rowIdT],
                })
            )

            await core.events.request(closeConnection(connectionId))
        }

        return Promise.resolve({})
    },

    TabelleErstellen: async function (workflowId, stepData) {
        if (stepData.tableName && typeof stepData.tableName === "string") {
            const connectionId = await core.events
                .request(openConnection(USERNAME, PASSWORD))
                .then(({ connectionId }) => connectionId)

            await createNewTable(connectionId, stepData.tableName)

            await core.events.request(closeConnection(connectionId))
        }
        return Promise.resolve({})
    },

    TabelleUmbenennen: async function (workflowId, stepData) {
        if (
            stepData.oldTableName &&
            typeof stepData.oldTableName === "string" &&
            stepData.newTableName &&
            typeof stepData.newTableName === "string"
        ) {
            const connectionId = await core.events
                .request(openConnection(USERNAME, PASSWORD))
                .then(({ connectionId }) => connectionId)

            await core.events.request(
                renameTable(connectionId, stepData.oldTableName, stepData.newTableName)
            )

            await core.events.request(closeConnection(connectionId))
        }
        return Promise.resolve({})
    },

    TabelleLöschen: async function (workflowId, stepData) {
        if (stepData.tableName && typeof stepData.tableName === "string") {
            const connectionId = await core.events
                .request(openConnection(USERNAME, PASSWORD))
                .then(({ connectionId }) => connectionId)

            await core.events.request(deleteTable(connectionId, stepData.tableName))

            await core.events.request(closeConnection(connectionId))
        }
        return Promise.resolve({})
    },

    SpalteHinzufügen: async function (workflowId, stepData) {
        if (
            stepData.tableName &&
            typeof stepData.tableName === "string" &&
            stepData.columnName &&
            typeof stepData.columnName === "string" &&
            stepData.columnType &&
            typeof stepData.columnType === "string" &&
            stepData.columnOptions &&
            typeof stepData.columnOptions === "string"
        ) {
            const connectionId = await core.events
                .request(openConnection(USERNAME, PASSWORD))
                .then(({ connectionId }) => connectionId)

            const tableExists = Boolean(
                await core.events.request(select(connectionId, stepData.tableName))
            )

            if (!tableExists) {
                await createNewTable(connectionId, stepData.tableName)
            }

            const knownColumnTypes: Record<string, ColumnType> = {
                integer: ColumnType.integer,
                bigInteger: ColumnType.bigInteger,
                text: ColumnType.text,
                string: ColumnType.string,
                float: ColumnType.float,
                decimal: ColumnType.decimal,
                boolean: ColumnType.boolean,
                date: ColumnType.date,
                datetime: ColumnType.datetime,
                time: ColumnType.time,
                binary: ColumnType.binary,
                uuid: ColumnType.uuid,
                increments: ColumnType.increments,
            }

            const knownColumnOptions: Record<string, SimpleColumnOption> = {
                alter: SimpleColumnOption.alter,
                index: SimpleColumnOption.index,
                notNullable: SimpleColumnOption.notNullable,
                nullable: SimpleColumnOption.nullable,
                primary: SimpleColumnOption.primary,
                unique: SimpleColumnOption.unique,
                unsigned: SimpleColumnOption.unsigned,
            }

            const column: Column = {
                name: stepData.columnName,
                type: knownColumnTypes[stepData.columnType.trim()],
                options: stepData.columnOptions
                    .split(";")
                    .map((option: string) => knownColumnOptions[option.trim()])
                    .filter(o => o) as SimpleColumnOption[],
            }

            await core.events.request(addColumn(connectionId, stepData.tableName, column))

            await core.events.request(closeConnection(connectionId))
        }
        return Promise.resolve({})
    },

    SpalteUmbenennen: async function (workflowId, stepData) {
        if (
            stepData.tableName &&
            typeof stepData.tableName === "string" &&
            stepData.oldColumnName &&
            typeof stepData.oldColumnName === "string" &&
            stepData.newColumnName &&
            typeof stepData.newColumnName === "string"
        ) {
            const connectionId = await core.events
                .request(openConnection(USERNAME, PASSWORD))
                .then(({ connectionId }) => connectionId)

            await core.events.request(
                renameColumn(
                    connectionId,
                    stepData.tableName,
                    stepData.oldColumnName,
                    stepData.newColumnName
                )
            )

            await core.events.request(closeConnection(connectionId))
        }
        return Promise.resolve({})
    },

    SpalteLöschen: async function (workflowId, stepData) {
        if (
            stepData.tableName &&
            typeof stepData.tableName === "string" &&
            stepData.columnName &&
            typeof stepData.columnName === "string"
        ) {
            const connectionId = await core.events
                .request(openConnection(USERNAME, PASSWORD))
                .then(({ connectionId }) => connectionId)

            await core.events.request(
                deleteColumn(connectionId, stepData.tableName, stepData.columnName)
            )

            await core.events.request(closeConnection(connectionId))
        }
        return Promise.resolve({})
    },

    ProzessReiheHinzufügen: async function (workflowId, stepData) {
        if (stepData.tableName && typeof stepData.tableName === "string") {
            const connectionId = await core.events
                .request(openConnection(USERNAME, PASSWORD))
                .then(({ connectionId }) => connectionId)

            const tableExists = Boolean(
                await core.events.request(select(connectionId, stepData.tableName))
            )

            if (!tableExists) {
                await createNewTable(connectionId, stepData.tableName)
            }

            await core.events.request(
                insert(connectionId, stepData.tableName, {
                    _id: workflowId,
                })
            )

            await core.events.request(closeConnection(connectionId))
        }
        return Promise.resolve({})
    },

    ProzessReiheLöschen: async function (workflowId, stepData) {
        if (stepData.tableName && typeof stepData.tableName === "string") {
            const connectionId = await core.events
                .request(openConnection(USERNAME, PASSWORD))
                .then(({ connectionId }) => connectionId)

            await core.events.request(
                deleteRow(connectionId, stepData.tableName, ["_id", workflowId])
            )

            await core.events.request(closeConnection(connectionId))
        }
        return Promise.resolve({})
    },

    TabellenWertErhöhen: async function (workflowId, stepData) {
        if (
            stepData.tableName &&
            typeof stepData.tableName === "string" &&
            stepData.columnName &&
            typeof stepData.columnName === "string" &&
            stepData.rowId &&
            typeof stepData.rowId === "string"
        ) {
            const connectionId = await core.events
                .request(openConnection(USERNAME, PASSWORD))
                .then(({ connectionId }) => connectionId)

            const rowData = ((
                await core.events.request(
                    select(connectionId, stepData.tableName, {
                        condition: ["_id", stepData.rowId === "$$" ? workflowId : stepData.rowId],
                        columns: [stepData.columnName],
                    })
                )
            )[0] || {}) as Record<string, number>

            const updateData: Record<string, number> = {}
            updateData[stepData.columnName] = rowData[stepData.columnName] + 1
            await core.events.request(
                update(connectionId, stepData.tableName, {
                    update: updateData,
                    condition: ["_id", stepData.rowId === "$$" ? workflowId : stepData.rowId],
                })
            )
            await core.events.request(
                deleteRow(connectionId, stepData.tableName, ["_id", workflowId])
            )

            await core.events.request(closeConnection(connectionId))
        }
        return Promise.resolve({})
    },

    TabellenWertVerringern: async function (workflowId, stepData) {
        if (
            stepData.tableName &&
            typeof stepData.tableName === "string" &&
            stepData.columnName &&
            typeof stepData.columnName === "string" &&
            stepData.rowId &&
            typeof stepData.rowId === "string"
        ) {
            const connectionId = await core.events
                .request(openConnection(USERNAME, PASSWORD))
                .then(({ connectionId }) => connectionId)

            const rowData = ((
                await core.events.request(
                    select(connectionId, stepData.tableName, {
                        condition: ["_id", stepData.rowId === "$$" ? workflowId : stepData.rowId],
                        columns: [stepData.columnName],
                    })
                )
            )[0] || {}) as Record<string, number>

            const updateData: Record<string, number> = {}
            updateData[stepData.columnName] = rowData[stepData.columnName] - 1
            await core.events.request(
                update(connectionId, stepData.tableName, {
                    update: updateData,
                    condition: ["_id", stepData.rowId === "$$" ? workflowId : stepData.rowId],
                })
            )
            await core.events.request(
                deleteRow(connectionId, stepData.tableName, ["_id", workflowId])
            )

            await core.events.request(closeConnection(connectionId))
        }
        return Promise.resolve({})
    },

    PrüfeObSpalteExistiert: async function (workflowId, stepData) {
        let decision = 2

        if (
            stepData.tableName &&
            typeof stepData.tableName === "string" &&
            stepData.columnName &&
            typeof stepData.columnName === "string"
        ) {
            const connectionId = await core.events
                .request(openConnection(USERNAME, PASSWORD))
                .then(({ connectionId }) => connectionId)

            const tableData = await core.events.request(
                select(connectionId, stepData.tableName, {
                    columns: [stepData.columnName],
                })
            )

            await core.events.request(closeConnection(connectionId))

            decision = tableData && tableData[stepData.columnName] ? 0 : 1
        }

        return Promise.resolve({
            decision: decision,
        })
    },

    PrüfeObTabelleExistiert: async function (workflowId, stepData) {
        let decision = 2

        if (stepData.tableName && typeof stepData.tableName === "string") {
            const connectionId = await core.events
                .request(openConnection(USERNAME, PASSWORD))
                .then(({ connectionId }) => connectionId)

            const tableData = await core.events.request(select(connectionId, stepData.tableName))

            await core.events.request(closeConnection(connectionId))

            decision = tableData ? 0 : 1
        }

        return Promise.resolve({
            decision: decision,
        })
    },
}
