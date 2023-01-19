/**
 * @module types.tables.base
 * Parameterized types to be used by the other table-relevant modules
 * (compare `types.tables.serialized` and `types.tables.rdg` for context)
 * This is the core of an abstraction layer built on top of `@intutable/lazy-views`, because its
 * types turned out not to be flexible enough after all, even though they were made specifically
 * for this application.
 */

import type {
    ColumnInfo,
    ParentColumnSpecifier as GroupColumn,
    SortColumn,
    JoinDescriptor,
} from "@intutable/lazy-views"
import type { TableDescriptor as RawTableDescriptor } from "@intutable/project-management/dist/types"
import type { ViewDescriptor, TableDescriptor } from "."
import type { Filter } from "../filter"
// #################################################################
//       Table
// #################################################################
/**
 * Placeholder alias for now. Will eventually be its own type.
 */
export type LinkDescriptor = JoinDescriptor

export type Table<COL, ROW> = {
    descriptor: TableDescriptor
    rawTable: RawTableDescriptor
    joins: LinkDescriptor[]
    columns: COL[]
    rows: ROW[]
}

// #################################################################
//       View
// #################################################################

export type View<COL, ROW> = {
    descriptor: ViewDescriptor
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
 * Then you need to provide this loss of information by a context.
 *
 * __Note__: These properties must be add to {@link Column} __and__ {@link SerializedColumn}.
 *
 */
export type MetaColumnProps = {
    /**
     * unique ID
     */
    readonly id: number
    /**
     * The ID of the column that a (view) column is based on. If a table has a column named
     * "Name" and ID 10, then a view on that table will have a column of the same name, and
     * the view column's `parentColumnId` will be 10.
     * In table columns, `parentColumnId` is null.
     */
    readonly parentColumnId: number | null
    /**
     * If the column is taken from another table via a link, then that link is a separate entity
     * and this is its ID. If the column is from the home table, equivalent to its `kind` not
     * being link or lookup, then `linkId` is null.
     */
    readonly linkId: number | null
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
     * column. Starts from 0, includes both ID and index. ID is index 0, index is index 1.
     * All other columns' indices can change.
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
