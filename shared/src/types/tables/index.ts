/**
 * @module shared.types.tables
 * This application uses the @intutable/lazy-views plugin to simulate
 * tables which import data from other tables - implemented as a view with
 * joins under the hood. The abstraction provided by lazy-views has proved
 * too rough, so dekanat-app-plugin (own workspace in this repo) provides
 * another abstraction layer of table, view, and column types.
 * Thus, we have three layers of data types, which we will generally refer to
 *  as:
 * "DB": the types from the lazy-views plugin. The specific column attributes
 * that we use are described in the type `./backend.DB.Column`.
 * "Serialized": serialized versions of the types that the front-end uses,
 * see `./serialized`.
 * "Deserialized": the types used to display data in the GUI. They are kept
 * in the GUI's own workspace.
 */
export type { Row, MetaColumnProps } from "./base"
import { ViewDescriptor as RawViewDescriptor, ColumnInfo } from "@intutable/lazy-views/dist/types"

export * from "./serialized"
export * from "./backend"

/**
 * A table is implemented as a table (project-management plugin) with a single
 * view built on it. What the user sees as a view is actually a second view
 * on the view-that-pretends-to-be-a-table. To disambiguate, we call the view-disguised-as-a-table
 * "table view" and the view-actually-used-as-a-view "filter view". Since it
 * is easier to find a view's underlying table/view than it is to get a table
 * and find out what view is associated with it, we just use lazy-views'
 * `ViewDescriptor` type for our tables, rather than passing the actual table's info around.
 *
 * The reason for this is that our tables can contain links to other tables and directly
 * show their data, which SQL only allows through complex joins. A lazy-view packages a table
 * and some of these joins in a neat unit.
 */
export type TableDescriptor = RawViewDescriptor
export type ViewDescriptor = RawViewDescriptor
export type TableId = TableDescriptor["id"]
export type ViewId = ViewDescriptor["id"]

export type RawColumn = ColumnInfo
