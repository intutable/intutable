import {
    CellContentType,
    isCellContentType,
} from "components/Data Grid/Editor/type-management"
import { EditorComponent } from "components/Data Grid/Editor/types/EditorComponent"
import { FormatterComponent } from "components/Data Grid/Formatter"
import { PLACEHOLDER } from "api/utils/de_serialize/PLACEHOLDER_KEYS"
import { Column, MetaColumnProps } from "types"
import { CellContentTypeComponents, ColumnKindComponents } from "./map"
import { headerRenderer } from "components/Data Grid/renderers"

/**
 * // TODO: this flexbility could be a potential error cause.
 *
 * In some cases (atm when the kind is 'standard') editor and formatter should have the same cell type.
 * There is the risk of a mismatch between the editor and the formatter.
 */

/**
 * ### ColumnUtility class
 *
 * Since {@link Column.Serialized.editor}, {@link Column.Serialized.formatter} and {@link Column.Serialized._kind}
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
 * Also read {@link MetaColumnProps._kind}.
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
 * explicitly sets this prop (see {@link MetaColumnProps._cellContentType}).
 */
export class ColumnUtility {
    constructor(public readonly column: Column.Serialized) {}

    // get column(): Column.Serialized {}

    public getKind(): MetaColumnProps["_kind"] {
        return this.column._kind
    }
    public getCellContentType(): CellContentType {
        return this.column._cellContentType
    }

    public isEditable(): boolean | null | undefined {
        const { _cellContentType, _kind, editable } = this.column

        // index columns are not editable, at least no by the editable
        if (_kind === "index") return false

        // TODO: further checking here, e.g. should link and lookup columns be editable??

        return editable
    }

    public getEditor(): EditorComponent | undefined | null {
        const { _cellContentType } = this.column

        if (isCellContentType(_cellContentType) === false)
            throw RangeError(
                `${_cellContentType} is not a valid serialized value for an editor`
            )

        return CellContentTypeComponents[_cellContentType].editor
    }

    public getFormatter(): FormatterComponent | undefined | null {
        const { _cellContentType, _kind } = this.column

        // special treatment when the kind is not 'standard'
        if (_kind !== "standard") return ColumnKindComponents[_kind]

        if (isCellContentType(_cellContentType) === false)
            throw RangeError(
                `${_cellContentType} is not a valid serialized value for an formatter`
            )

        // otherwise choose the formatter actually by the value of this property
        return CellContentTypeComponents[_cellContentType].formatter
    }

    public getHeaderRenderer(): Column["headerRenderer"] {
        // for now no actions on index columns
        if (this.column._kind === "index") return null

        return headerRenderer
    }

    // static deserialize(column: Column.Serialized): Column { }
    // public deserialize(): Column { }

    // static serialize(column: Column): Column.Serialized { }
    // public serialize(): Column.Serialized { }

    /**
     * Identifies columns which are not part of the real object data, but rather
     * control elements specific to this GUI, such as the row index column and
     * selector checkbox.
     */
    static isAppColumn(
        column: Column.Serialized | Column.Deserialized
    ): boolean {
        return (
            column.key === PLACEHOLDER.COL_SELECTOR || column._kind === "index"
        )
    }
}
