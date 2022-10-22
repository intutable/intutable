/**
 * @module types.tables.base
 * Parameterized types to be used by the other table-relevant modules
 * (compare `types.tables.serialized` and `types.tables.rdg` for context)
 */

import type {
    ColumnInfo,
    ParentColumnSpecifier as GroupColumn,
    SortColumn,
    ViewDescriptor,
    ViewInfo,
} from "@intutable/lazy-views"
import type { Filter } from "../filter"

// #################################################################
//       Table
// #################################################################
export type Table<COL, ROW> = {
    metadata: Omit<ViewInfo, "rowOptions">
    columns: COL[]
    rows: ROW[]
}

// #################################################################
//       View
// #################################################################

export type View<COL, ROW> = {
    descriptor: ViewDescriptor
    /**
     * Since {@link columns} only contains direct display-relevant data and
     * not backend-side metadata like IDs, we we also keep the original
     * ColumnInfos around so we have access e.g. to the column's ID when it
     * is to be deleted.
     */
    metaColumns: ColumnInfo[]
    /** Filters for the displayed data. */
    filters: Filter[]
    /**
     * What column data are sorted by (by the database; if you want to
     * implement this client-side, do not use this prop).
     * Not implemented yet.
     */
    sortColumns: SortColumn[]
    /**
     * What column data are grouped by (by the database; if you intend to
     * implement this client-side, do not use this prop).
     * Not implemented yet.
     */
    groupColumns: GroupColumn[]
    /** RDG-side display columns. */
    columns: COL[]
    /** RDG-side display rows. */
    rows: ROW[]
}

// #################################################################
//       Row
// #################################################################

export type Row = {
    readonly _id: number
    __rowIndex__: number
    [key: string]: unknown
}

// #################################################################
//       Column
// #################################################################

/**
 * @description General, app-relevant properties for a column - these are
 * (usually) relevant to both serialized and deserialized columns.
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
     * - `index`
     *
     */
    _kind: "standard" | "link" | "lookup" | "index"
    /**
     * In addition to {@link SerializedColumn.editor} and {@link SerializedColumn.formatter},
     * this explicitly sets the type.
     */
    _cellContentType: string
    /**
     * @property {number | null} __columnIndex__ ordering position of the
     * column.
     */
    __columnIndex__: number | null
    /**
     * User-facing "primary" column. This would be something like e.g. the
     * name of a person - hopefully unique, but not necessarily. This is why
     * the _real_ primary key is the hidden _id column which the user cannot
     * see or edit.
     */
    userPrimary: boolean
}
