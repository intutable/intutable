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

export enum CHANNEL {
    PROJECT_MANAGEMENT = "project_management",
}

export const API = {
    get: {
        projectsList: getProjects,
        tablesList: getTablesFromProject,
        table: getTableData,
    },
    post: {
        project: createProject,
        table: createTableInProject,
    },
    put: {
        projectName: changeProjectName,
        tableName: changeTableName,
    },
    delete: {
        project: removeProject,
        table: removeTableFromProject,
    },
}
