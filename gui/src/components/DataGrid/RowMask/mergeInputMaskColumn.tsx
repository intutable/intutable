import { InputMaskColumn, InputMaskColumnProps } from "@shared/input-masks/types"
import { isColumnIdOrigin } from "@shared/input-masks/utils"
import { Column } from "types/tables/rdg"

export type MergedColumn = Column & InputMaskColumnProps

export const merge = (columns: Column[], withInputMaskColumns: InputMaskColumn[]): MergedColumn[] =>
    columns.map(column => {
        const maskCol = withInputMaskColumns.find(c =>
            isColumnIdOrigin(c.origin) ? c.origin.id === column.id : c.origin.name === column.name
        )
        if (maskCol) {
            const { origin, ...rest } = maskCol
            Object.assign(column, rest)
        }
        const merged = column as MergedColumn

        // add default values if nullish
        merged.inputRequired ??= false
        merged.suppressInputLabel ??= false
        merged.disallowNewSelectValues ??= false

        return column
    })
