import { User } from "auth"
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
    removeColumn,
    changeColumnName,
} from "./endpoints/column"
import { updateRow, createRow, deleteRow } from "./endpoints/row"

export const makeAPI = (user: User) =>
    ({
        get: {
            projectList: getProjects.bind(null, user),
            tableList: getTablesFromProject.bind(null, user),
            table: getTableData.bind(null, user),
        },
        post: {
            project: createProject.bind(null, user),
            table: createTableInProject.bind(null, user),
            column: createColumnInTable.bind(null, user),
            row: createRow.bind(null, user),
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
            row: deleteRow.bind(null, user),
        },
    } as const)
