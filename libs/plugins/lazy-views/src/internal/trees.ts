/**
 * Procedures for creating and examining [ViewTrees]{@link trees.ViewTree}
 * which contain all the metadata of a view in a tree structure. ALL of it,
 * that includes data of sub-views, source tables, ...
 * This is the first stage in the generation of a view's query: Getting all
 * necessary metadata from the database in one data structure.
 *
 * @packageDocumentation
 */
import { getTableInfo } from "@intutable-org/project-management/dist/requests"

import { getCore as core } from "./core"
import { V } from "../meta"
import { makeColumnInfo, makeTableKey, makeColumnKey } from "."
import * as meta from "../meta"
import {
    SelectableSpecifier,
    SourceTableSpecifier,
    SourceViewSpecifier,
    SelectableDescriptor,
    branchOnSelectable,
} from "./selectable"
import * as trees from "../types/trees"
import { ColumnDescriptor } from "../types/internal"
import { JoinId, ViewInfo, ColumnInfo, JoinDescriptor, ParentColumnDescriptor } from "../types"

export * from "../types/trees"

/**
 * Gather all metadata for a view from the DB - including metadata of source
 * tables and views. It also includes source tables' columns that do not
 * appear in the final view, because we need these for sorting, filtering,
 * grouping, and joining.
 */
export async function expandViewTree(connectionId: string, id: number): Promise<trees.ViewTree> {
    return expandViewTreeNode(connectionId, id, null)
}

/** Flatten a ViewTree into ViewInfo (public API metadata). */
export function flattenViewTree(tree: trees.ViewTree): ViewInfo {
    return {
        descriptor: tree.descriptor,
        source: getDescriptorFromNode(tree.source),
        joins: tree.joins.map(jtree => jtree.descriptor),
        columns: getColumnsFromTree(tree),
        rowOptions: tree.rowOptions,
    }
}

/**
 * @param childColumns If this view is being expanded not as a top-level
 * view but as the source of a join, we prune away all the columns of each
 * of this view's joins that aren't referenced in the higher-level join.
 * This makes circular joins possible, otherwise they would cause
 * an infinite loop.
 */
async function expandViewTreeNode(
    connectionId: string,
    id: number,
    childColumns: ColumnDescriptor[] | null
): Promise<trees.ViewTree> {
    const viewRow = await meta.getViewMetaRow(connectionId, id)
    const name = viewRow[V.NAME]
    const sourceSpec = meta.getSelectableFromDbRow(viewRow)
    const source = await getSelectableNode(connectionId, sourceSpec, null)
    const columns = await meta.getColumnDescriptors(connectionId, id, sourceSpec)
    const joinTrees = await meta
        .getJoinDescriptorsOfView(connectionId, id)
        .then(joins => pruneIrrelevantJoins(connectionId, id, joins, childColumns))
        .then(async joins => Promise.all(joins.map(j => expandJoinTreeNode(connectionId, id, j))))
    const rowOptions = JSON.parse(viewRow[V.ROW_OPTIONS])
    return {
        descriptor: { id, name },
        source,
        columns,
        joins: joinTrees,
        rowOptions,
    }
}

/**
 * Expand a view's or join's source node, either a TableInfo (which is then
 * a leaf node) or another ViewTree.
 */
async function getSelectableNode(
    connectionId: string,
    n: SelectableSpecifier,
    childColumns: ColumnDescriptor[] | null
): Promise<trees.SourceTableNode | trees.SourceViewNode> {
    return branchOnSelectable(
        n,
        async (n: SourceTableSpecifier) => ({
            type: n.type,
            table: await core().events.request(getTableInfo(connectionId, n.id)),
        }),
        async (n: SourceViewSpecifier) => ({
            type: n.type,
            view: await expandViewTreeNode(connectionId, n.id, childColumns),
        })
    )
}

/** Get the table name (in the DB, not user-facing) for a SelectableNode. */
export function getTableNameFromNode(n: trees.SelectableNode): string {
    return branchOnSelectable(
        n,
        (n: trees.SourceTableNode) => n.table.table.key,
        (n: trees.SourceViewNode) => n.view.descriptor.name
    )
}

function getDescriptorFromNode(n: trees.SelectableNode): SelectableDescriptor {
    return branchOnSelectable(
        n,
        (n: trees.SourceTableNode) => ({ type: n.type, table: n.table.table }),
        (n: trees.SourceViewNode) => ({ type: n.type, view: n.view.descriptor })
    )
}

/**
 * Get table/view name alias - which prevents clashes in the case of
 * multiple links to the same target source - for a selectable.
 */
export function getSourceAlias(joinId: JoinId, source: trees.SelectableNode): string {
    return makeTableKey(joinId, getTableNameFromNode(source))
}

/** Get the columns of the top-level, final view from a ViewTree. */
function getColumnsFromTree(tree: trees.ViewTree): ColumnInfo[] {
    const sourceColumns = getSourceColumns(tree)
    return sourceColumns.concat(...tree.joins.map(getJoinColumns))
}
/**
 * Extract all (top-level) columns of a ViewTree which are only in the
 * base source, not in any joins' sources.
 */
export function getSourceColumns(tree: trees.ViewTree): ColumnInfo[] {
    const parentColumns = getColumnsFromNode(tree.source)
    return tree.columns.map(c => {
        const parentColumn = parentColumns.find(p => p.id === c.parentColumnId)!
        return makeColumnInfo(c, parentColumn)
    })
}

/** Extract the top-level columns of a join. */
export function getJoinColumns(join: trees.JoinTree): ColumnInfo[] {
    const parentColumns = getColumnsFromNode(join.source)
    return join.columns.map(c => {
        const parentColumn = parentColumns.find(p => p.id === c.parentColumnId)!
        return makeColumnInfo(c, parentColumn)
    })
}

/** Get the columns of a view/join's source. */
export function getColumnsFromNode(n: trees.SelectableNode): ParentColumnDescriptor[] {
    return branchOnSelectable(
        n,
        (n: trees.SourceTableNode) => n.table.columns,
        (n: trees.SourceViewNode) => getColumnsFromTree(n.view)
    )
}

/**
 * Get the key of a parent column. If it is from a table, the column's plain
 * name will suffice, if it is from a view, then get its alias. Exported
 * because the parent columns are what WHERE, ORDER BY, etc. clauses apply to.
 * @example
 * ```
 * SELECT j0_base_table.name AS c10_name, ... ,
 *        j2_joined_view.c3_address AS c18_address ...
 * FROM ...
 * -- in this case, name and c3_address are the parent column keys.
 * ```
 */
export function makeParentColumnKey(
    source: trees.SelectableNode,
    id: number,
    name: string
): string {
    return branchOnSelectable(
        source,
        _ => name,
        _ => makeColumnKey(id, name)
    )
}

// this is not a performance optimization, it prevents infinite recursion
// in the case of a cycle of joins. Because while cyclic joins are possible,
// chains of column references must always end in a _table_ column.
async function pruneIrrelevantJoins(
    connectionId: string,
    viewId: number,
    joins: JoinDescriptor[],
    childColumns: ColumnDescriptor[] | null
): Promise<JoinDescriptor[]> {
    // for the head view, expand all joins
    if (childColumns === null) return joins
    else {
        const areRelevant = await Promise.all(
            joins.map(async join => {
                // if any of the parent join's columns map to columns within
                // `join`, it is relevant. otherwise, prune.
                const columns = await meta.getColumnDescriptors(connectionId, viewId, join)
                const relevantColumns = columns.filter(pc =>
                    childColumns.some(cc => cc.parentColumnId === pc.id)
                )
                return relevantColumns.length !== 0
            })
        )
        // since filter interprets a promise as true, filtering with async
        // functions requires this trick here.
        return joins.filter((_j, index) => areRelevant[index])
    }
}
async function expandJoinTreeNode(
    connectionId: string,
    viewId: number,
    join: JoinDescriptor
): Promise<trees.JoinTree> {
    const columns = await meta.getColumnDescriptors(connectionId, viewId, join)
    const sourceId = await meta.getForeignSource(connectionId, join.id)
    const source = await getSelectableNode(connectionId, sourceId, columns)
    return { descriptor: join, columns, source }
}
