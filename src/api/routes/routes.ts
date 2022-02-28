import { CHANNEL, METHOD } from "api/constants"
import type { User } from "auth"
import type { PMTypes as PM, TableData } from "types"
import type Obj from "types/Obj"

/**
 * @constant
 */
export const Routes = {
    get: {
        /**
         * Fetches a list of projects.
         * @function
         * @param {User} user
         * @returns {PM.Project[]}
         */
        projectList: `/request/${CHANNEL.PROJECT_MANAGEMENT}/${METHOD.getProjects}`,
        /**
         * Fetches a list of tables of a certain project.
         * @function
         * @param {User} user
         * @param {PM.Project.ID} projectId id of the project
         * @returns {PM.Table[]}
         */
        tableList: `/request/${CHANNEL.PROJECT_MANAGEMENT}/${METHOD.getTablesFromProject}`,
        /**
         * Fetches a table with its data.
         * @function
         * @param {User} user
         * @param {PM.Table.ID} tableId
         * @returns {TableData.DBSchema>} after the hook run
         * @returns {TableData.Serialized>} after the middelware parsed it
         *  @returns {TableData.Serialized>} finally after the middelware deserialized it
         */
        table: `/request/${CHANNEL.PROJECT_MANAGEMENT}/${METHOD.getTableData}`,
    },
} as const

export const getAllRoutes = () =>
    Object.entries(Routes)
        .map(([_, value]) => Object.entries(value).map(([_, route]) => route))
        .flat()

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

export const isRoute = (value: unknown): value is Route => {
    if (typeof value !== "string") return false
    return (getAllRoutes() as string[]).includes(value)
}
