import {
    ColumnDescriptor as PmColumn,
    TableDescriptor as PmTableDescriptor,
    TableInfo,
    TableData as PmTableData,
} from "@intutable/project-management/dist/types"

import { types as lvt } from "@intutable/lazy-views"

/**
 * some aliases for the types from PM and LV. Since this plugin has its own "tabledata", "viewdata",
 * etc. types, things get pretty confusing quickly.
 */
export type RawViewId = lvt.ViewId
export type RawTableId = lvt.TableId // should have been from PM, but it doesnt export an alias

export type RawTableDescriptor = PmTableDescriptor
export type RawViewDescriptor = lvt.ViewDescriptor

export type RawViewOptions = lvt.ViewOptions

export type RawViewInfo = lvt.ViewInfo
export type RawTableInfo = TableInfo

export type RawViewData = lvt.ViewData
export type RawTableData = PmTableData<RawRow>

export type RawRow = Record<string, unknown>

export type RawTableColumnDescriptor = PmColumn
export type RawViewColumnInfo = lvt.ColumnInfo

/**
 * In order to link backward link items to their corresponding row's ID, we do an aggregation
 * of the backlink column's value and the ID column's value into a JSON object that we later
 * augment into a {@link shared.types.gui.BackwardLinkCellContent}
 * (see ../constants.ts, backwardLinkAggregate). Unfortunately, LV's using preGroup option
 * aggregates these values into arrays. So instead of an array { value, id }[], we end up
 * having a single object { value[], id[] } that we then have to zip in the parsing stage.
 * This type represents that single object.
 * Rule R1: `value` and `_id` always either have the same length, or are both null
 */
export type RawBackwardLinkCellItems = {
    value: string[] | RawBackwardLinkCellItems[] | null
    _id: number[] | null
}
