import cells from "@datagrid/Cells"
import {
    CopyEvent,
    DataGridProps,
    FillEvent,
    PasteEvent,
} from "react-data-grid"
import { Column, Row } from "types"

type CopyEventHandler = {
    handleOnCopy: NonNullable<DataGridProps<Row>["onCopy"]> // rdg event
    handleOnCopyMultiple: () => void // component functionality
}
type PasteEventHandler = {
    handleOnPaste: NonNullable<DataGridProps<Row>["onPaste"]> // rdg event
}
type FillEventHandler = {
    handleOnFill: NonNullable<DataGridProps<Row>["onFill"]> // rdg event
}
type ClipboardEvents = CopyEventHandler & PasteEventHandler & FillEventHandler
/**
 * NOTE: When you use these callbacks, don't forget to bind the 'this'-context.
 * Resp. do 'onEvent={e => onCopy(e)}' instead of 'onEvent={onCopy}'.
 */
export class ClipboardUtil implements ClipboardEvents {
    constructor(private columns: Column[]) {}

    private getColumn(key: string) {
        const column = this.columns.find(column => column.key === key)
        if (column == null)
            throw new Error(
                `Clipboard Event Handler: column with key '${key}' not found`
            )
        return column
    }

    private util(column: Column) {
        return cells.getCell(column._cellContentType!)
    }

    /** Copy Event – fires when a user copies a cell, e.g. cmd+c on a cell */
    public handleOnCopy(event: CopyEvent<Row>) {
        const rawContent = event.sourceRow[event.sourceColumnKey]
        const column = this.getColumn(event.sourceColumnKey)

        const exportedContent = this.util(column).export(rawContent)

        navigator.clipboard.writeText(exportedContent ?? "")
    }

    public handleOnCopyMultiple() {
        return
    }

    /** Paste Event – fires when a user pastes content into cell, e.g. cmd+v on a cell */
    public handleOnPaste(event: PasteEvent<Row>) {
        const { targetRow, targetColumnKey, sourceRow, sourceColumnKey } = event
        const targetColumn = this.getColumn(targetColumnKey)
        const targetUtil = this.util(targetColumn)
        const sourceRawContent = targetUtil.parse(sourceRow[sourceColumnKey])

        if (targetUtil.isValid(sourceRawContent) === false) return targetRow // passes source content the target validator?

        return {
            ...targetRow,
            [targetColumnKey]: sourceRawContent,
        }
    }

    // TODO: handle fill is currently not working
    /** Fill Event – fires when a user drags a cell across multiple other cells of that column to override them  */
    public handleOnFill(event: FillEvent<Row>) {
        const { sourceRow, columnKey, targetRow } = event
        return { ...targetRow, [columnKey]: sourceRow[columnKey as keyof Row] }
    }
}
