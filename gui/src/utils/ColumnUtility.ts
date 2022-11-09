import { Column, MetaColumnProps, ViewData } from "types"
import cells, { Cell } from "@datagrid/Cells"
import { ColumnInfo } from "@intutable/lazy-views"

/**
 * // TODO: this flexbility could be a potential error cause.
 *
 * In some cases (atm when the kind is 'standard') editor and formatter should have the same cell type.
 * There is the risk of a mismatch between the editor and the formatter.
 */

/**
 * ### ColumnUtility class
 *
 * Since {@link Column.Serialized.editor}, {@link Column.Serialized.formatter} and {@link Column.Serialized.kind}
 * are interdependent, choosing the right component in the process of deserialization is quite tricky.
 *
 * With this class, you can easily choose the right component for {@link Column.editor} __and__ {@link Column.formatter}
 * for a given column.
 *
 * ---
 *
 * __Note__: Below are some explanations of the different terms and their interdependent structure.
 *
 * #### Editor
 *
 * Editor is the component that is used to edit (it's typically a input field) the content of a single cell.
 * This means that it is only rendered when a cell is clicked.
 * Otherwise the formatter is rendered to only display the content.
 *
 * Different types of contents require different editors (We have many types {@link CellContentType}).
 * E.g. editing numbers is different from editing dates. Imagine editing a number: you parse the input
 * and only numeric values pass. On the other hand, editing a date requires to correctly parse the input
 * for date formats.
 *
 * That means that every cell has a specific editor that checks if the input is valid for its type.
 * In this sense you can say that a column has a 'type' since every cell of that column
 * should have the same type and therefore the same editor.
 *
 * A editor is mostly required (at least whenever a column resp. its cell are editable,
 * e.g. the boolean type uses only a formatter) and
 * is independent and not affected by the formatter or kind.
 *
 * #### Kind (of a column)
 *
 * Has nothing to do with cells or the type of content of. It's like a meta type of a column.
 * It affects the formatter – but only if its type is **not** 'standard'. A column with a kind of 'standard'
 * means that it is a normal column and the formatter is not affected. But when its kind is different, the formatter
 * must be ajusted. E.g. a lookup requires a special formatter in order to choose the right value.
 *
 * Also read {@link MetaColumnProps.kind}.
 *
 * #### Formatter
 *
 * Formatter is the component that is used to display the content of a single cell
 * when the cell is not clicked/edited. This means that it is only rendered when a cell is clicked.
 * Otherwise the editor is rendered to only allow editing the content.
 *
 * Strings a Numbers can be displayed as usal. But the email type gets a special icon instead of displaying
 * the whole email. Or the date type is displayed as a special format dependent on the region.
 *
 * But the formatter does more. Things complelty independent of its type. E.g. when the kind is 'lookup' and
 * the cursor needs to be special in order to pick values or some mechanics for selecting multiple cells.
 *
 * #### Explicit Type
 *
 * Because the editor and formatter can be nullish a new prop
 * explicitly sets this prop (see {@link MetaColumnProps.cellType}).
 */
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
            row.__rowIndex__,
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
        return column.key === "select-row" || column.kind === "index" // TODO: last one will be obsolete soon
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
