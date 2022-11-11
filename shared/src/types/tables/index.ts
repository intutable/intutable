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
export * from "./serialized"
export * from "./backend"
