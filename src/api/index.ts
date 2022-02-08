import { CurrentUser } from "@app/context/AuthContext"
import {
    getProjects,
    createProject,
    removeProject,
    changeProjectName,
} from "./project"
import {
    getTablesFromProject,
    getTableData,
    createTableInProject,
    removeTable,
    changeTableName,
} from "./table"
import {
    getColumnsFromTable,
    createColumnInTable,
    changeColumnName,
    removeColumn,
} from "./column"
import { updateRow } from "./row"
export * from "../types/types"
export * from "./utils"
export * from "./coreinterface"
export * from "./Type Annotations/ProjectManagement"

export enum CHANNEL {
    DATABASE = "database",
    PROJECT_MANAGEMENT = "project-management",
    USER_AUTHENTICATION = "user-authentication",
}

// TODO: integrate into AuthContext and export from this ctx
export const makeAPI = (user: CurrentUser) =>
    ({
        get: {
            projectsList: getProjects.bind(null, user),
            tablesList: getTablesFromProject.bind(null, user),
            table: getTableData.bind(null, user),
            columns: getColumnsFromTable.bind(null, user),
        },
        post: {
            project: createProject.bind(null, user),
            table: createTableInProject.bind(null, user),
            column: createColumnInTable.bind(null, user),
        },
        put: {
            projectName: changeProjectName.bind(null, user),
            tableName: changeTableName.bind(null, user),
            columnName: changeColumnName.bind(null, user),
            columnAttribute: () => "not implemented",
            row: updateRow.bind(null, user),
        },
        delete: {
            project: removeProject.bind(null, user),
            table: removeTable.bind(null, user),
            column: removeColumn.bind(null, user),
        },
    } as const)
