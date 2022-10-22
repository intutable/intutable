/**
 * @module types.tables.rdg
 * Table, View, and Column data for display in the DataGrid. These types
 * often have un-serializable props (e.g. React components), so they cannot
 * be sent to and fetched from the backend. For that, they must be serialized
 * (see `types.tables.serialized` and `src/utils/SerDes`)
 */

import { Column as ReactDataGrid_Column } from "react-data-grid"
import { Table, View, Row } from "./base"

/**
 * {@link https://github.com/adazzle/react-data-grid/blob/513a03606e5d8c8366f2f02cf78cc99212e059df/src/types.ts#L7}
 *
 * Note: We have augmented this type with
 *  [MetaColumnProps]{@link types.MetaColumnProps}, see 
 * `types/module-augmentation/react-data-grid`
 */
export type Column = ReactDataGrid_Column<Row> // useful because it sets the generic type be default

/**
 * @deprecated no GUI components directly display table data. Can we get
 * rid of it?
 * @legacy
 * {@link ViewData}
 */
export type DeserializedTableData = Table<Column, Row>

export type ViewData = View<Column, Row>
