/**
 * ### Project Management
 * Type Annotation
 */
export namespace project_management {
    /**
     * core/plugion unique id
     */
    export type UID = {
        /**
         * core/plugion unique id
         * used for columns, rows, tables etc.
         */
        readonly _id: number
    }
}

/**
 * Project Management Constants
 * @constant
 */
export const project_management_constants = {
    /**
     * Key for {@link project_management.UID}
     */
    UID_KEY: "_id",
} as const
