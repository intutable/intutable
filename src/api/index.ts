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
    removeTableFromProject,
    changeTableName,
} from "./table"
export * from "./types"
export * from "./utils"
export * from "./coreinterface"

export enum CHANNEL {
    PROJECT_MANAGEMENT = "project-management",
}

// TODO: integrate into AuthContext and export from this ctx
export const makeAPI = (user: CurrentUser) =>
    ({
        get: {
            projectsList: getProjects.bind(null, user),
            tablesList: getTablesFromProject.bind(null, user),
            table: getTableData.bind(null, user),
        },
        post: {
            project: createProject.bind(null, user),
            table: createTableInProject.bind(null, user),
        },
        put: {
            projectName: changeProjectName.bind(null, user),
            tableName: changeTableName.bind(null, user),
        },
        delete: {
            project: removeProject.bind(null, user),
            table: removeTableFromProject.bind(null, user),
        },
    } as const)
