import { Row } from "types"
import { PLACEHOLDER } from "./PLACEHOLDER_KEYS"

export const serialize = (row: Row): Row => {
    const sRow = { ...row } as Row
    return sRow
}

export const deserialize = (row: Row, rowIndex: number): Row =>
    ({
        ...row,
        __rowIndex__: rowIndex,
    } as Row)
