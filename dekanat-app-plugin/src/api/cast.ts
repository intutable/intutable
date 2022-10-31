import { DB } from "shared/src/types"
import type { Row, SerializedColumn } from "../types/tables"
import { isValid as isValidDate } from "date-fns"

export type CastOperations = {
    /**
     * `null` is interpreted as 'not set'
     * whereas other values like an empty string are
     * interpreted by the frontend as a value set by the user.
     * `undefined` and an empty string will be converted to `null`.
     */
    isEmpty: (value: unknown) => false | null
    toBoolean: (value: unknown) => boolean
    toDatabaseBoolean: (value: unknown) => DB.Boolean
    toArray: <T = unknown>(value: unknown) => T[]
    toDatabaseArray: (value: unknown) => string
    toDate: (value: unknown) => Date
    toDatabaseDate: (value: unknown) => string
}

export class Cast implements CastOperations {
    isEmpty(value: unknown): false | null {
        // in case of `undefined` or an empty string we replace it with `null`
        if (value === null || typeof value === "undefined" || value === "")
            return null

        return false
    }

    toBoolean(value: unknown): boolean {
        if (typeof value === "boolean") return value
        if (value === 1 || value === "1" || value === "true") return true
        if (value === 0 || value === "0" || value === "false") return false
        throw new RangeError(`Could not cast value to boolean: ${value}`)
    }
    toDatabaseBoolean(value: unknown): DB.Boolean {
        try {
            const bool = this.toBoolean(value) // passes
            return bool ? 1 : 0
        } catch (_) {
            throw new RangeError(
                `Could not cast value to (database) boolean: ${value}`
            )
        }
    }

    toArray<T = unknown>(value: unknown): T[] {
        if (Array.isArray(value)) return value

        if (typeof value === "string") {
            const jsonparsed = JSON.parse(value)
            if (Array.isArray(jsonparsed)) return jsonparsed
        }

        throw new RangeError(`Could not cast value to array: ${value}`)
    }
    toDatabaseArray(value: unknown): string {
        try {
            const arr = this.toArray(value) // passes
            return JSON.stringify(arr)
        } catch (_) {
            throw new RangeError(
                `Could not cast value to (database) Array: ${value}`
            )
        }
    }

    toDate(value: unknown): Date {
        // case instance
        if (value instanceof Date && isValidDate(value)) return value // <- NaN is also an instance of Date

        // case timestamp (string or number)
        if (Cast.isInteger(value)) {
            const timestamp = Number.parseInt(value as string)
            if (isValidDate(timestamp) === false) return null
            return new Date(timestamp)
        }

        // TODO: consider case: iso string

        throw new RangeError(`Could not cast value to Date: ${value}`)
    }
    toDatabaseDate(value: unknown): string {
        try {
            const date = this.toDate(value) // passes
            return date.toString()
        } catch (_) {
            throw new RangeError(
                `Could not cast value to (database) Date: ${value}`
            )
        }
    }

    static isInteger(str: unknown): boolean {
        if (typeof str === "number") return true
        if (typeof str !== "string") return false

        const int = Number.parseInt(str)
        const isInt = isNaN(int) === false

        return isInt
    }
    static isFloat(str: unknown): boolean {
        if (typeof str === "number") return true
        if (typeof str !== "string") return false

        const float = Number.parseFloat(str)
        const isFloat = isNaN(float) === false

        return isFloat
    }
    static isNumeric(str: unknown): boolean {
        if (typeof str === "number") return true
        if (typeof str !== "string") return false

        return Cast.isInteger(str) || Cast.isFloat(str)
    }
}

export const castRow = (row: DB.Restructured.Row): Row => ({} as Row)

export const castColumn = (column: DB.Restructured.Column): SerializedColumn =>
    ({} as SerializedColumn)
