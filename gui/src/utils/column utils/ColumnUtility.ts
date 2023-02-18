import { cellMap } from "@datagrid/Cells"
import { ColumnGroup } from "@shared/input-masks/types"
import { SELECT_COLUMN_KEY } from "react-data-grid"
import { Column, Row, ViewData } from "types"

type Sortable = Column.Deserialized | Column.Serialized | Row | ColumnGroup

export class ColumnUtility {
    /** 'true' if yes, if no an array with indices of rows whose cells do not suit the new type */
    static canInterchangeColumnType(
        to: string,
        column: Column.Deserialized | Column.Serialized,
        view: ViewData.Deserialized
    ): true | number[] {
        const targetUtil = cellMap.getCellCtor(to)
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

    /** sort algorithm for columns based on its index */
    static sortByIndex<T extends Column.Deserialized | Column.Serialized | Row>(a: T, b: T) {
        return a.index > b.index ? 1 : -1
    }
}
