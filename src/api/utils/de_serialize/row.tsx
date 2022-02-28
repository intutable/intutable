import { Row } from "types"
import { PLACEHOLDER } from "./PLACEHOLDER_KEYS"
import { Checkbox } from "@mui/material"

export const serialize = (row: Row): Row.Serialized => {
    const sRow = { ...row } as Row.Serialized
    delete sRow[PLACEHOLDER.ROW_INDEX_KEY]
    delete sRow[PLACEHOLDER.SELECTOR_COLUMN_KEY]
    return sRow
}

export const deserialize = (row: Row.Serialized, rowIndex: number): Row =>
    ({
        ...row,
        [PLACEHOLDER.ROW_INDEX_KEY]: rowIndex,
        [PLACEHOLDER.SELECTOR_COLUMN_KEY]: <Checkbox />,
    } as Row)