import type { Column as ReactDataGrid_Column } from "react-data-grid"
import { PLACEHOLDER } from "api/utils/de_serialize/PLACEHOLDER_KEYS"
import type { CellContentType } from "@datagrid/Editor_Formatter/types/CellContentType"
import type { ViewInfo } from "@intutable/lazy-views"
import { project_management } from "./type-annotations/project-management"
import { deserialize } from "api/utils/de_serialize/column"
import { Formatter } from "@datagrid/Formatter/types/Formatter"

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
 */
export type Column = ReactDataGrid_Column<Row> // alias

/**
 *
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
     * when kind is __not__ 'standard'
     */
    _kind: "standard" | "link" | "lookup"
}

/**
 * Copied from react-data-grid's type `Column` and modified to save an object
 * of this type properly to the db.
 *
 * See the original type in {@link https://github.com/adazzle/react-data-grid/blob/bc23189c4d41725ebd80fdacfa1ddd4054e29658/src/types.ts}).
 *
 * Those properties that are not listed compared to the original type are not used.
 * Additional notes will explain how the property is modified compared to the original property.
 */
type SerializedColumn = Partial<project_management.UID> &
    MetaColumnProps & {
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
         * @param {(undefined | null)} [width] Column width. If not specified, it will be determined automatically based on grid width and specified widths of other columns.
         *
         * See the orignal type here: {@link Column}.
         *
         * ---
         *
         * __Note__: This feature is not supported yet.
         */
        width?: null
        /**
         * @param {(undefined | null)} [minWidth] Minimum column width in px.
         *
         * See the orignal type here: {@link Column}.
         *
         * ---
         *
         * __Note__: This feature is not supported yet.
         */
        minWidth?: null
        /**
         * @param {(undefined | null)} [maxWidth] Maximum column width in px.
         *
         * See the orignal type here: {@link Column}.
         *
         * ---
         *
         * __Note__: This feature is not supported yet.
         */
        maxWidth?: null
        /**
         * @param {(undefined | null)} [cellClass]
         *
         * See the orignal type here: {@link Column}.
         *
         * ---
         *
         * __Note__: This feature is not supported yet.
         */
        cellClass?: null
        /**
         * @param {(undefined | null)} [headerCellClass]
         *
         * See the orignal type here: {@link Column}.
         *
         * ---
         *
         * __Note__: This feature is not supported yet.
         */
        headerCellClass?: null
        /**
         * @param {(undefined | null)} [summaryCellClass]
         *
         * See the orignal type here: {@link Column}.
         *
         * ---
         *
         * __Note__: This feature is not supported yet.
         */
        summaryCellClass?: null
        /**
         * @param {(Formatter)} formatter Formatter to be used to render the cell content.
         * default=standard
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
        formatter: Formatter
        /**
         * @param {(undefined | null)} [summaryFormatter]
         *
         * See the orignal type here: {@link Column}.
         *
         * ---
         *
         * __Note__: This feature is not supported yet.
         */
        summaryFormatter?: null
        /**
         * @param {(undefined | null)} [groupFormatter]
         *
         * See the orignal type here: {@link Column}.
         *
         * ---
         *
         * __Note__: This feature is not supported yet.
         */
        groupFormatter?: null
        /**
         * @param {(boolean | undefined | null)} [editable=true] Enables cell editing (default is 'true'). If set and no editor property specified, then a textinput will be used as the cell editor
         *
         * See the orignal type here: {@link Column}.
         *
         * ---
         *
         * __Warning__: This type is customized for serialization (see below).
         *
         * __Note__: the orignal type allows besides a string
         * a function that determines the value based on a given row.
         */
        editable?: boolean | null
        /**
         * @param {(undefined | null)} [colSpan]
         *
         * See the orignal type here: {@link Column}.
         *
         * ---
         *
         * __Note__: This feature is not supported yet.
         */
        colSpan?: null
        /**
         * @param {(undefined | null)} [frozen] Determines whether column is frozen or not.
         *
         * See the orignal type here: {@link Column}.
         *
         * ---
         *
         * __Note__: This feature is not supported yet.
         */
        frozen?: null
        /**
         * @param {(undefined | null)} [resizable] Enable resizing of a column.
         *
         * See the orignal type here: {@link Column}.
         *
         * ---
         *
         * __Note__: This feature is not supported yet.
         */
        resizable?: null
        /**
         * @param {(undefined | null)} [sortable] Enable sorting of a column.
         *
         * See the orignal type here: {@link Column}.
         *
         * ---
         *
         * __Note__: This feature is not supported yet.
         */
        sortable?: null
        /**
         * @param {(undefined | null)} [sortDescendingFirst] Sets the column sort order to be descending instead of ascending the first time the column is sorted.
         *
         * See the orignal type here: {@link Column}.
         *
         * ---
         *
         * __Note__: This feature is not supported yet.
         */
        sortDescendingFirst?: null
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
             * @param {(undefined | null)} [renderFormatter=false] (default is 'false').
             *
             * See the orignal type here: {@link Column}.
             *
             * ---
             *
             * __Note__: This feature is not supported yet.
             */
            renderFormatter?: null
            /**
             * @param {(undefined | null)} [editOnClick=false] (default is 'false').
             *
             * See the orignal type here: {@link Column}.
             *
             * ---
             *
             * __Note__: This feature is not supported yet.
             */
            editOnClick?: null
            /**
             * @param {(undefined | null)} [comitOnOutsideClick=true] (default is 'true').
             *
             * See the orignal type here: {@link Column}.
             *
             * ---
             *
             * __Note__: This feature is not supported yet.
             */
            comitOnOutsideClick?: null
            /**
             * @param {(undefined | null)} [onCellKeyDown] Prevent default to cancel editing.
             *
             * See the orignal type here: {@link Column}.
             *
             * ---
             *
             * __Note__: This feature is not supported yet.
             */
            onCellKeyDown?: null
            /**
             * @param {(undefined | null)} [onNavigation] Control the default cell navigation behavior while the editor is open.
             *
             * See the orignal type here: {@link Column}.
             *
             * ---
             *
             * __Note__: This feature is not supported yet.
             */
            onNavigation?: null
        }
        /**
         * @param {(undefined | null)} [headerRenderer] Header renderer for each header cell.
         *
         * See the orignal type here: {@link Column}.
         *
         * ---
         *
         * __Note__: This feature is not supported yet.
         */
        headerRenderer?: null
    }

export namespace Column {
    export type Serialized = SerializedColumn
    export type Deserialized = Column
}
