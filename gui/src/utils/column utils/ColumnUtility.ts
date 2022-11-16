import cells, { Cell } from "@datagrid/Cells"
import { Column, ViewData } from "types"

export class ColumnUtility {
    public cell: Cell

    constructor(public readonly column: Column.Serialized) {
        this.cell = cells.getCell(this.column.cellType)
    }

    /** 'true' if yes, if no an array with indices of rows whose cells do not suit the new type */
    static canInterchangeColumnType(
        to: string,
        column: Column.Deserialized | Column.Serialized,
        view: ViewData.Deserialized
    ): true | number[] {
        const targetUtil = cells.getCell(to)
        const data = view.rows.map(row => [
            row.index,
            row[column.key],
        ]) as Array<[number, unknown]>

        const invalidCells = data.filter(
            cell => targetUtil.isValid(cell[1]) === false
        )

        return invalidCells.length === 0
            ? true
            : invalidCells.map(cell => cell[0])
    }

    /**
     * Identifies columns which are not part of the real object data, but rather
     * control elements specific to this GUI, such as the row index column and
     * selector checkbox.
     */
    static isAppColumn(
        column: Column.Serialized | Column.Deserialized
    ): boolean {
        return column.key === "select-row"
    }

    /**
     *
     */
    static isProxy(column: Column.Serialized | Column.Deserialized): boolean {
        const col = column as unknown
        return (
            Object.prototype.hasOwnProperty.call(col, "__isProxy") &&
            (col as { __isProxy: unknown }).__isProxy === true
        )
    }
}
