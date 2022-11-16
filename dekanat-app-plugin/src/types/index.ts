import { ViewDescriptor as LV_View } from "@intutable/lazy-views/dist/types"

/**
 * A table is implemented as a table (project-management plugin) with a single
 * view built on it. What the user sees as a view is actually a second view
 * on the view. To disambiguate, we call the view-disguised-as-a-table
 * "table view" and the view-actually-used-as-a-view "filter view". Since it
 * is easier to find a view's underlying table/view than it is to get a table
 * and find out what view is associated with it, we just use lazy-views'
 * `ViewDescriptor` type for our tables.
 * The reason we do this is because our tables can contain links to other
 * tables and directly show their data, which is not immediately possible
 * with plain SQL tables, we need views with joins in them.
 */
export type TableDescriptor = LV_View
export type ViewDescriptor = LV_View
export type TableId = TableDescriptor["id"]
export type ViewId = ViewDescriptor["id"]
