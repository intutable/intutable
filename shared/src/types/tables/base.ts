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
     * TODO: we are gradually expanding the display columns to contain
     * everything needed, hopefully making this prop obsolete soon.
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
    index: number
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
    readonly id: number
    /**
     * @property {(standard | link | lookup)} kind meta type of a column.
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
    kind: "standard" | "link" | "lookup" | "index"
    /**
     * In addition to {@link SerializedColumn.editor} and {@link SerializedColumn.formatter},
     * this explicitly sets the type.
     */
    cellType: string
    /**
     * @property {number | null} index ordering position of the
     * column.
     */
    index: number
    /**
     * In some cases, we may want to show the user a preview of a row,
     * which needs a "main" or "primary" column. We also want to encourage
     * the user to ensure that each row has a unique identifier of sorts.
     * To avoid making the user deal with the auto-generated, meaningless
     * numeric `_id`s that form our real, database primary keys, we add
     * this fake "user primary" column, to be used in previews. It also has
     * a tooltip saying "try to keep it unique" but does not impose any
     * actual integrity conditions.
     */
    isUserPrimaryKey: boolean
    /**
     * Wether the column is visible or not.
     */
    hidden: boolean
}
