import { TableInfo } from "@intutable-org/project-management/dist/types"

import { ColumnDescriptor } from "./internal"

import { ViewDescriptor, JoinDescriptor, RowOptions } from "."
import { Selectable } from "./selectable"

/**
 * A tree of a join table with all its joins and their views' subqueries fully
 * expanded. Used to construct the query for actually fetching the view's data.
 * Mutually recursive with {@link JoinTree}.
 * @prop {ColumnDescriptor[]} columns The columns from the view's source.
 * {@link ColumnDescriptor} is not a full description, only enough IDs to
 * construct the full {@link ColumnInfo} from the source.
 */
export interface ViewTree {
    descriptor: ViewDescriptor
    source: SelectableNode
    columns: ColumnDescriptor[]
    joins: JoinTree[]
    rowOptions: RowOptions
}

/**
 * The source (SELECT FROM ...) of a view, which can be a table or another view.
 */
export type SelectableNode = Selectable<SourceTableNode, SourceViewNode>
/** Source table of a view. */
export interface SourceTableNode extends SelectableNode {
    table: TableInfo
}
/** Source view for a (higher-order) view. */
export interface SourceViewNode extends SelectableNode {
    view: ViewTree
}

/**
 * A join including its subquery as a {@link ViewTree}. Mutually recursive with
 * {@link ViewTree}.
 * @prop {ColumnDescriptor} columns The columns of the join's source.
 * {@link ColumnDescriptor} is not a full description, only enough info to
 * assemble the full {@link ColumnInfo} from the join's source.
 */
export interface JoinTree {
    descriptor: JoinDescriptor
    columns: ColumnDescriptor[]
    source: SelectableNode
}
