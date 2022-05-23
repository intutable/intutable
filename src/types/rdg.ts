import type {
    Column as ReactDataGrid_Column,
    CalculatedColumn,
} from "react-data-grid"
import { PLACEHOLDER } from "api/utils/de_serialize/PLACEHOLDER_KEYS"
import type { CellContentType } from "@datagrid/Editor/types/CellContentType"
import type { ViewInfo } from "@intutable/lazy-views"
import { project_management } from "./type-annotations/project-management"
import { Formatter } from "@datagrid/Formatter/formatters"
import { deserialize } from "api/utils/de_serialize/column"
import Obj from "./Obj"
import { FormatterComponent } from "@datagrid/Formatter/"
import { FormatterComponentMap } from "@datagrid/Formatter"
import { headerRenderer } from "@datagrid/renderers/HeaderRenderer/HeaderRenderer"

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
     * @property {(standard | link | lookup)} _kind meta type of a column.
     *
     * ---
     *
     * __Note__: this is kind of redundant and could easly be merged with {@link SerializedColumn.formatter}.
     * We decided not to in favor of keeping the type clean and preserve the meaning of {@link Column.formatter}.
     *
     * #### Options
     * - `standard`: ignore this, only use whatever is defined in {@link FormatterComponentMap} in `standard` derived from {@link Formatter}.
     * - `link`: use {@link LinkColumnFormatter}
     * - `lookup`: use {@link LookupColumnFormatter}
     *
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
     * @property {string} name The name of the column. By default it will be displayed in the header cell.
     *
     * See the orignal type here: {@link Column.name}.
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
     * @property {string} key A unique key to distinguish each column.
     *
     * See the orignal type here: {@link Column.key}.
     */
    key: string
    /**
     * @property {(number | string | undefined | null)} [width] Column width. If not specified, it will be determined automatically based on grid width and specified widths of other columns.
     *
     * See the orignal type here: {@link Column.width}.
     */
    width?: number | string | null
    /**
     * @property {(number | undefined | null)} [minWidth] Minimum column width in px.
     *
     * See the orignal type here: {@link Column.minWidth}.
     */
    minWidth?: number | null
    /**
     * @property {(number | undefined | null)} [maxWidth] Maximum column width in px.
     *
     * See the orignal type here: {@link Column.maxWidth}.
     */
    maxWidth?: number | null
    /**
     * @property {(string | undefined | null)} [cellClass]
     *
     * See the orignal type here: {@link Column.cellClass}.
     *
     * ---
     *
     * __Warning__: This type is customized for serialization (see below).
     *
     * __Note__: the orignal type allows besides a boolean value
     * a function that determines the value `cellClass` based on a
     * given row that is received as a argument by the function.
     * This function would need to be serialized like other props.
     */
    cellClass?: string | null
    /**
     * @property {(string | undefined | null)} [headerCellClass]
     *
     * See the orignal type here: {@link Column.headerCellClass}.
     */
    headerCellClass?: string | null
    /**
     * @property {(undefined | null)} [summaryCellClass]
     *
     * See the orignal type here: {@link Column.summaryCellClass}.
     */
    summaryCellClass?: string | null
    /**
     * @property {(Formatter)} formatter Formatter to be used to render the cell content ({@default standard}).
     *
     * See the orignal type here: {@link Column.formatter}.
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
     * that can be extended by a component defined by {@link MetaColumnProps._kind}.
     */
    formatter: Formatter
    /**
     * @property {(undefined | null)} [summaryFormatter]
     *
     * See the orignal type here: {@link Column.summaryFormatter}.
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
     * @property {(undefined | null)} [groupFormatter]
     *
     * See the orignal type here: {@link Column.groupFormatter}.
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
     * @property {(boolean | undefined | null)} [editable=true] Enables cell editing ({@default true}). If set and no editor property specified, then a textinput will be used as the cell editor
     *
     * See the orignal type here: {@link Column.editable}.
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
     */
    editable?: boolean | null /* | string */
    /**
     * @property {(string | undefined | null)} [colSpan]
     *
     * See the orignal type here: {@link Column.colSpan}.
     *
     * ---
     *
     * __Warning__: This type is customized for serialization (see below).
     *
     * __Note__: the orignal type requires a function.
     * That function would be deserialized based
     * on a type in {@link deserialize}.
     *
     * __Note__: This feature is not supported yet.
     * No deserialization takes place.
     */
    colSpan?: string | null
    /**
     * @property {(boolean | undefined | null)} [frozen] Determines whether column is frozen or not.
     *
     * See the orignal type here: {@link Column.frozen}.
     */
    frozen?: boolean | null
    /**
     * @property {(boolean | undefined | null)} [resizable] Enable resizing of a column.
     *
     * See the orignal type here: {@link Column.resizable}.
     */
    resizable?: boolean | null
    /**
     * @property {(boolean | undefined | null)} [sortable] Enable sorting of a column.
     *
     * See the orignal type here: {@link Column.sortable}.
     */
    sortable?: boolean | null
    /**
     * @property {(boolean | undefined | null)} [sortDescendingFirst] Sets the column sort order to be descending instead of ascending the first time the column is sorted.
     *
     * See the orignal type here: {@link Column.sortDescendingFirst}.
     */
    sortDescendingFirst?: boolean | null
    /**
     * @property {(CellContentType)} editor Editor to be rendered when cell of column is being edited. If set, then the column is automatically set to be editable.
     *
     * See the orignal type here: {@link Column.editor}.
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
    editorOptions?: null | {
        /**
         * @property {(boolean | undefined | null)} [renderFormatter=false] ({@default false}).
         *
         * See the orignal type here: {@link Column.editorOptions}.
         */
        renderFormatter?: boolean | null
        /**
         * @property {(boolean | undefined | null)} [editOnClick=false] ({@default false}).
         *
         * See the orignal type here: {@link Column.editorOptions}.
         */
        editOnClick?: boolean | null
        /**
         * @property {(boolean | undefined | null)} [commitOnOutsideClick=true] ({@default true}).
         *
         * See the orignal type here: {@link Column.editorOptions}.
         */
        commitOnOutsideClick?: boolean | null
        /**
         * @property {(string | undefined | null)} [onCellKeyDown] Prevent default to cancel editing.
         *
         * See the orignal type here: {@link Column.editorOptions}.
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
         * @property {(string | undefined | null)} [onNavigation] Control the default cell navigation behavior while the editor is open.
         *
         * See the orignal type here: {@link Column.editorOptions}.
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
     * @property {(string | undefined | null)} [headerRenderer] Header renderer for each header cell.
     *
     * See the orignal type here: {@link Column.headerRenderer}.
     *
     * ---
     *
     * __Warning__: This type is customized for serialization (see below).
     *
     * __Note__: the orignal type requires a component.
     * At the moment we use a default component {@link headerRenderer}, it gets
     * inserted in {@link deserialize}.
     */
    headerRenderer?: string | null
}

type DatabaseColumnAttributes = {
    _kind: string
    userPrimary: 0 | 1
    displayName: string
    editable?: 1 | 0 | null
    editor: string
    formatter: string
    width?: string | null
    minWidth?: string | null
    maxWidth?: string | null
    cellClass?: string | null
    headerCellClass?: string | null
    summaryCellClass?: string | null
    summaryFormatter?: string | null
    groupFormatter?: string | null
    colSpan?: string | null
    frozen?: 1 | 0 | null
    resizable?: 1 | 0 | null
    sortable?: 1 | 0 | null
    sortDescendingFirst?: 1 | 0 | null
    renderFormatter?: 1 | 0 | null
    editOnClick?: 1 | 0 | null
    commitOnOutsideClick?: 1 | 0 | null
    onCellKeyDown?: string | null
    onNavigation?: string | null
    headerRenderer?: string | null
}

export namespace Column {
    export type SQL = DatabaseColumnAttributes
    export type Serialized = SerializedColumn
    export type Deserialized = Column
}