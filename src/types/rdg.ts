import type {
    Column as ReactDataGrid_Column,
    CalculatedColumn,
} from "react-data-grid"
import { PLACEHOLDER } from "api/utils/de_serialize/PLACEHOLDER_KEYS"
import type { CellContentType } from "@datagrid/Editor/types/CellContentType"
import type { ViewInfo } from "@intutable/lazy-views"
import { project_management } from "./type-annotations/project-management"
import { deserialize } from "api/utils/de_serialize/column"
import { Formatter } from "@datagrid/Formatter/types/Formatter"
import Obj from "./Obj"

// #################################################################
//       Table
// #################################################################

type Table<COL, ROW> = {
    // Asserting that the view's source is always a table.
    metadata: ViewInfo
    columns: COL[]
    rows: ROW[]
}

export type TableData = Table<Column, Row>

type SerializedTableData = Table<SerializedColumn, SerializedRow>

export namespace TableData {
    export type Serialized = SerializedTableData
    export type Deserialized = TableData
}

// #################################################################
//       Row
// #################################################################

export type Row = project_management.UID & {
    readonly [PLACEHOLDER.ROW_INDEX_KEY]: number
    [key: string]: unknown
}

type SerializedRow = project_management.UID & {
    [key: string]: unknown
}

export namespace Row {
    export type Serialized = SerializedRow
    export type Deserialized = Row
}

// #################################################################
//       Column
// #################################################################

/**
 * {@link https://github.com/adazzle/react-data-grid/blob/513a03606e5d8c8366f2f02cf78cc99212e059df/src/types.ts#L7}
 *
 * alias
 */
export type Column = ReactDataGrid_Column<Row> // useful because it sets the generic type be default

/**
 * @description Additional properties for a column.
 *
 * __Note__: not every column will have these props. Some columns are automatically
 * inserted by rdg, like the Column Selector or Index Column. Be aware of this and careful.
 *
 * __Note__: in many rdg handlers you want get a column of type {@link Column}.
 * You will receive a column of type {@link CalculatedColumn}.
 * Then you need to provide this loss of information by a context e.g.
 *
 * __Note__: These properties must be add to {@link Column} __and__ {@link SerializedColumn}.
 *
 * __Note__: Once properties are supported in this type those values can not
 * be saved to the database, this type needs to be separated into
 * a derserialized and serialized one as well.
 */
export type MetaColumnProps = {
    /**
     * core/plugion unique id
     * used for columns, rows, tables etc.
     */
    readonly _id: number
    /**
     * Kind / meta type of the column
     *
     * __Note__: when `_kind` is __not__ 'standard'
     */
    _kind: "standard" | "link" | "lookup"
}

/**
 * @description This type is meant to describe {@link Column} in a way it can be serialized and saved to database.
 *
 * See the original type in {@link https://github.com/adazzle/react-data-grid/blob/bc23189c4d41725ebd80fdacfa1ddd4054e29658/src/types.ts}).
 *
 * ---
 *
 * __Note__: Additional notes will explain how the property is modified compared to the original property.
 */
type SerializedColumn = MetaColumnProps & {
    /**
     * @param {string} name The name of the column. By default it will be displayed in the header cell.
     *
     * See the orignal type here: {@link Column}.
     *
     * ---
     *
     * __Warning__: This type is customized for serialization (see below).
     *
     * __Note__: the orignal type allows besides a string a value of {@type {ReactElement}}.
     * This is useful when displaying icons etc. in the column header.
     * This feature is not supported yet.
     */
    name: string
    /**
     * @param {string} key A unique key to distinguish each column.
     *
     * See the orignal type here: {@link Column}.
     */
    key: string
    /**
     * @param {(number | string | undefined | null)} [width] Column width. If not specified, it will be determined automatically based on grid width and specified widths of other columns.
     *
     * See the orignal type here: {@link Column}.
     */
    width?: number | string | null
    /**
     * @param {(number | undefined | null)} [minWidth] Minimum column width in px.
     *
     * See the orignal type here: {@link Column}.
     */
    minWidth?: number | null
    /**
     * @param {(number | undefined | null)} [maxWidth] Maximum column width in px.
     *
     * See the orignal type here: {@link Column}.
     */
    maxWidth?: number | null
    /**
     * @param {(string | undefined | null)} [cellClass]
     *
     * See the orignal type here: {@link Column}.
     */
    cellClass?: string | null
    /**
     * @param {(string | undefined | null)} [headerCellClass]
     *
     * See the orignal type here: {@link Column}.
     */
    headerCellClass?: string | null
    /**
     * @param {(undefined | null)} [summaryCellClass]
     *
     * See the orignal type here: {@link Column}.
     */
    summaryCellClass?: string | null
    /**
     * @param {(Formatter)} formatter Formatter to be used to render the cell content ({@default standard}).
     *
     * See the orignal type here: {@link Column}.
     *
     * ---
     *
     * __Warning__: This type is customized for serialization (see below).
     *
     * __Note__: the orignal type requires a component.
     * This component is set based on the given string by
     * {@type {Formatter}} during deserialization in {@link deserialize}.
     *
     * __Note__: The formatter component is a HOC ({@link https://reactjs.org/docs/higher-order-components.html})
     * that can be extended by a component defined by `_kind` in {@link MetaColumnProps}.
     */
    formatter: Formatter
    /**
     * @param {(undefined | null)} [summaryFormatter]
     *
     * See the orignal type here: {@link Column}.
     *
     * ---
     *
     * __Warning__: This type is customized for serialization (see below).
     *
     * __Note__: the orignal type requires a component.
     * That component would be deserialized based
     * on a type in {@link deserialize}.
     *
     * __Note__: This feature is not supported yet.
     * No deserialization takes place.
     */
    summaryFormatter?: string | null
    /**
     * @param {(undefined | null)} [groupFormatter]
     *
     * See the orignal type here: {@link Column}.
     *
     * ---
     *
     * __Warning__: This type is customized for serialization (see below).
     *
     * __Note__: the orignal type requires a component.
     * That component would be deserialized based
     * on a type in {@link deserialize}.
     *
     * __Note__: This feature is not supported yet.
     * No deserialization takes place.
     */
    groupFormatter?: string | null
    /**
     * @param {(boolean | undefined | null)} [editable=true] Enables cell editing ({@default true}). If set and no editor property specified, then a textinput will be used as the cell editor
     *
     * See the orignal type here: {@link Column}.
     *
     * ---
     *
     * __Warning__: This type is customized for serialization (see below).
     *
     * __Note__: the orignal type allows besides a boolean value
     * a function that determines the value `editable` based on a
     * given row that is received as a argument by the function.
     * This function would need to be serialized like other props,
     * therefore – in this serialized version of {@link Column} – the
     * type `string` can be used (currently commented out).
     *
     */
    editable?: boolean | null /* | string */
    /**
     * @param {(string | undefined | null)} [colSpan]
     *
     * See the orignal type here: {@link Column}.
     *
     * ---
     *
     * __Note__: This feature is not supported yet.
     */
    colSpan?: string | null
    /**
     * @param {(boolean | undefined | null)} [frozen] Determines whether column is frozen or not.
     *
     * See the orignal type here: {@link Column}.
     */
    frozen?: boolean | null
    /**
     * @param {(boolean | undefined | null)} [resizable] Enable resizing of a column.
     *
     * See the orignal type here: {@link Column}.
     */
    resizable?: boolean | null
    /**
     * @param {(boolean | undefined | null)} [sortable] Enable sorting of a column.
     *
     * See the orignal type here: {@link Column}.
     */
    sortable?: boolean | null
    /**
     * @param {(boolean | undefined | null)} [sortDescendingFirst] Sets the column sort order to be descending instead of ascending the first time the column is sorted.
     *
     * See the orignal type here: {@link Column}.
     */
    sortDescendingFirst?: boolean | null
    /**
     * @param {(CellContentType)} editor Editor to be rendered when cell of column is being edited. If set, then the column is automatically set to be editable.
     *
     * See the orignal type here: {@link Column}.
     *
     * ---
     *
     * __Warning__: This type is customized for serialization (see below).
     *
     * __Note__: the orignal type requires a component.
     * This component is set based on the given string by
     * {@type {CellContentType}} during deserialization in {@link deserialize}.
     */
    editor: CellContentType
    editorOptions?: {
        /**
         * @param {(boolean | undefined | null)} [renderFormatter=false] ({@default false}).
         *
         * See the orignal type here: {@link Column}.
         */
        renderFormatter?: boolean | null
        /**
         * @param {(boolean | undefined | null)} [editOnClick=false] ({@default false}).
         *
         * See the orignal type here: {@link Column}.
         */
        editOnClick?: boolean | null
        /**
         * @param {(boolean | undefined | null)} [commitOnOutsideClick=true] ({@default true}).
         *
         * See the orignal type here: {@link Column}.
         */
        commitOnOutsideClick?: boolean | null
        /**
         * @param {(string | undefined | null)} [onCellKeyDown] Prevent default to cancel editing.
         *
         * See the orignal type here: {@link Column}.
         *
         * ---
         *
         * __Warning__: This type is customized for serialization (see below).
         *
         * __Note__: the orignal type requires a event callback.
         * That function would be deserialized based
         * on a type in {@link deserialize}.
         *
         * __Note__: This feature is not supported yet.
         * No deserialization takes place.
         */
        onCellKeyDown?: string | null
        /**
         * @param {(string | undefined | null)} [onNavigation] Control the default cell navigation behavior while the editor is open.
         *
         * See the orignal type here: {@link Column}.
         *
         * ---
         *
         * __Warning__: This type is customized for serialization (see below).
         *
         * __Note__: the orignal type requires a event callback.
         * That function would be deserialized based
         * on a type in {@link deserialize}.
         *
         * __Note__: This feature is not supported yet.
         * No deserialization takes place.
         */
        onNavigation?: string | null
    }
    /**
     * @param {(string | undefined | null)} [headerRenderer] Header renderer for each header cell.
     *
     * See the orignal type here: {@link Column}.
     *
     * ---
     *
     * __Warning__: This type is customized for serialization (see below).
     *
     * __Note__: the orignal type requires a component.
     * That component would be deserialized based
     * on a type in {@link deserialize}.
     *
     * __Note__: This feature is not supported yet.
     * No deserialization takes place.
     */
    headerRenderer?: string | null
}

export namespace Column {
    export type Serialized = SerializedColumn
    export type Deserialized = Column
}
