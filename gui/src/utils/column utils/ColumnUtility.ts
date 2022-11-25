import cells, { Cell } from "@datagrid/Cells"
import { SELECT_COLUMN_KEY } from "react-data-grid"
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
        const data = view.rows.map(row => [row.index, row[column.key]]) as Array<[number, unknown]>

        const invalidCells = data.filter(cell => targetUtil.isValid(cell[1]) === false)

        return invalidCells.length === 0 ? true : invalidCells.map(cell => cell[0])
    }

    /**
     * Identifies columns which are not part of the real object data, but rather
     * control elements specific to this GUI, such as the row index column and
     * selector checkbox.
     *
     * @deprecated This is probably deprecated, because the SelectorColumn is not a part of the data anymore.
     * It gets injected before giving the data to the grid component.
     */
    static isAppColumn(column: Column.Serialized | Column.Deserialized): boolean {
        return column.key === SELECT_COLUMN_KEY
    }

    /**
     *
     */
    static isProxy(column: Column.Serialized | Column.Deserialized): boolean {
        const col = column as unknown
        return (
            Object.prototype.hasOwnProperty.call(col, "__isProxy") && (col as { __isProxy: unknown }).__isProxy === true
        )
    }

    /** sort algorithm for columns based on its index */
    static sortByIndex<T extends Column.Deserialized | Column.Serialized>(a: T, b: T) {
        return a.index > b.index ? 1 : -1
    }
}
