import {
    DB,
    SerializedColumn,
    BackwardLinkCellContent,
    BackwardLinkCellContentItem,
} from "shared/dist/types"
import { RawBackwardLinkCellItems } from "../types/raw"

export class RowParser {
    public parseRows(
        columns: SerializedColumn[],
        rows: DB.Restructured.Row[]
    ): DB.Restructured.Row[] {
        let processedRows = rows
        columns.forEach(column => {
            if (column.kind === "backwardLink" || column.kind === "backwardLookup") {
                processedRows = processedRows.map(row => ({
                    ...row,
                    [column.key]: zipRawBackwardLinkCellItems(
                        row[column.key] as RawBackwardLinkCellItems
                    ),
                }))
            }
        })
        return processedRows
    }
}

function zipRawBackwardLinkCellItems(
    items: RawBackwardLinkCellItems
): BackwardLinkCellContent<{ _id: number }>["items"] {
    // @ts-ignore
    if (!(items.value === null && items._id === null) && items.value.length !== items._id.length)
        throw TypeError(
            "RawBackwardLinkItem's props are neither both null nor equal length: " +
                // @ts-ignore
                ` value: ${items.value ?? items.value.length}, _id: ${
                    // @ts-ignore
                    items._id ?? items._id.length
                }`
        )
    if (items.value === null) return [{ value: null, props: { _id: -1 } }]
    const result: BackwardLinkCellContentItem<{ _id: number }>[] = []
    for (let i = 0; i < items.value.length; i++) {
        const value = items.value[i]
        if (value === null) result.push({ value: null, props: { _id: -1 } })
        else if (typeof value === "string")
            result.push({
                value,
                // @ts-ignore
                props: { _id: items._id[i] },
            })
        else
            result.push({
                value: zipRawBackwardLinkCellItems(value),
                // @ts-ignore
                props: { _id: items._id[i] },
            })
    }
    return result
}

export const rowParser = new RowParser()
