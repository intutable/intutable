import { CurrentUser } from "@app/context/AuthContext"
import {
    getProjects,
    createProject,
    removeProject,
    changeProjectName,
} from "./endpoints/project"
import {
    getTablesFromProject,
    getTableData,
    createTableInProject,
    removeTable,
    changeTableName,
} from "./endpoints/table"
import {
    createColumnInTable,
    changeColumnKey,
    removeColumn,
    changeColumnName,
} from "./endpoints/column"
import { updateRow } from "./endpoints/row"

export * from "./utils/ProjectManagement_TypeAnnotations"

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
            column: createColumnInTable.bind(null, user),
        },
        put: {
            projectName: changeProjectName.bind(null, user),
            tableName: changeTableName.bind(null, user),
            columnKey: changeColumnKey.bind(null, user),
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
