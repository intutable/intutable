import type { User } from "auth"
import type { TableData } from "types"
import type Obj from "types/Obj"
import type { PMTypes as PM } from "../../types"
import { CHANNEL } from "../constants/CHANNEL"
import { METHOD } from "../constants/METHODS"

/**
 * @constant
 */
export const Routes = {
    get: {
        /**
         * Fetches a list of projects.
         * @function
         * @param {User} user
         * @returns {Promise.resolve<PM.Project.List>}
         */
        projectList: `/request/${CHANNEL.PROJECT_MANAGEMENT}/${METHOD.getProjects}`,
        /**
         * Fetches a list of tables of a certain project.
         * @function
         * @param {User} user
         * @param {PM.Project.ID} projectId id of the project
         * @returns {Promise.resolve<PM.Table.List>}
         */
        tableList: `/request/${CHANNEL.PROJECT_MANAGEMENT}/${METHOD.getTablesFromProject}`,
        /**
         * Fetches a table with its data.
         * @function
         * @param {User} user
         * @param {PM.Table.ID} tableId
         * @returns {Promise<TableData.Serialized>}
         */
        table: `/request/${CHANNEL.PROJECT_MANAGEMENT}/${METHOD.getTableData}`,
    },
} as const

/**
 * Utility type that returns the type of the response of a method of `Routes`.
 */
export type ResponseTypeOf<ROUTE extends Route> =
    ROUTE extends "/request/project-management/getProjects"
        ? PM.Project[]
        : ROUTE extends "/request/project-management/getTablesFromProject"
        ? PM.Table[]
        : ROUTE extends "/request/project-management/getTableData"
        ? TableData.Serialized
        : void

type ValuesOf<T> = {
    [Prop in keyof T]: T[Prop] extends Obj ? ValuesOf<T[Prop]> : T[Prop]
}[keyof T]
type ValueMap = {
    [P in ValuesOf<typeof Routes>]: P
}
/**
 * Utility type that returns a union type of all nested values of `Routes`.
 */
export type Route = keyof ValueMap
