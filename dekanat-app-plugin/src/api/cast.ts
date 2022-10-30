import { DB } from "shared/src/types"
import type { Row, SerializedColumn } from "../types/tables"

export type CastOperations = {
    toBoolean: (value: unknown) => boolean
    toNumber: (value: unknown) => number
    toArray: <T = unknown>(value: unknown) => T[]
    toDate: (value: unknown) => Date
}

export const castRow = (row: DB.Restructured.Row): Row => {}

export const castColumn = (
    column: DB.Restructured.Column
): SerializedColumn => {}
