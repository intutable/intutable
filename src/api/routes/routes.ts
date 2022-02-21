import { CHANNEL } from "../constants/CHANNEL"
import { METHOD } from "../constants/METHODS"
import type { ProjectManagement as PM } from "../utils/ProjectManagement_TypeAnnotations"
import type { CurrentUser } from "@app/context/AuthContext"
import type { SerializedTableData } from "@app/types/types"
import type { Key } from "swr"
import type Obj from "@utils/Obj"
import { RouteHas } from "next/dist/lib/load-custom-routes"

/**
 * @constant
 */
export const Routes = {
    get: {
        /**
         * Fetches a list of projects.
         * @function
         * @param {CurrentUser} user
         * @returns {Promise.resolve<PM.Project.List>}
         */
        projectList: `/request/${CHANNEL.PROJECT_MANAGEMENT}/${METHOD.getProjects}`,
        /**
         * Fetches a list of tables of a certain project.
         * @function
         * @param {CurrentUser} user
         * @param {PM.Project.ID} projectId id of the project
         * @returns {Promise.resolve<PM.Table.List>}
         */
        tableList: `/request/${CHANNEL.PROJECT_MANAGEMENT}/${METHOD.getTablesFromProject}`,
        /**
         * Fetches a table with its data.
         * @function
         * @param {CurrentUser} user
         * @param {PM.Table.ID} tableId
         * @returns {Promise<SerializedTableData>}
         */
        table: `/request/${CHANNEL.PROJECT_MANAGEMENT}/${METHOD.getTableData}`,
    },
} as const

/**
 * Utility type that returns the type of the response of a method of `Routes`.
 */
export type ResponseTypeOf<ROUTE extends Route> =
    ROUTE extends "/request/project-management/getProjects"
        ? PM.Project.List
        : ROUTE extends "/request/project-management/getTablesFromProject"
        ? PM.Table.List
        : ROUTE extends "/request/project-management/getTableData"
        ? SerializedTableData
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
