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
