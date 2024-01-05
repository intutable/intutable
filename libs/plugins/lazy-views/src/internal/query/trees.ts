/**
 * Module for converting a [ViewTree]{@link ../../types/ViewTree} (abstract,
 * hierarchical, contains IDs) to a [QueryTree]{@link Q.QueryTree} (flatly
 * structured like an SQL query, contains only string identifiers) which can
 * easily be converted into a database query.
 * This extra processing stage allows us to easily switch between different
 * methods of query building.
 *
 * @packageDocumentation
 */

import {
    JoinId,
    JoinType,
    RowOptions,
    ColumnInfo,
    ParentColumnSpecifier,
    ParentColumnDescriptor,
} from "../../types"
import { branchOnSelectable } from "../selectable"
import { makeColumnKey } from ".."
import * as t from "../trees"
import * as c from "../../types/condition"
import * as q from "../../types/query"
import { getColumnsFromNode, getSourceAlias, makeParentColumnKey } from "../trees"

import { mapCondition } from "../condition"
import OKind = c.OperandKind

/**
 * Go through a {@link ViewTree} and collect the names/keys required to build
 * a query.
 * @param oneTimeRowOptions row options to override the ones stored in the DB for the view.
 * `conditions`, `sortColumns`, and `groupColumns` will each override the property of the
 * view's own row options; if they are not set, the original ones are used.
 */
export function buildQueryTree(
    tree: t.ViewTree,
    oneTimeRowOptions: Partial<RowOptions> = {}
): q.QueryTree {
    const selectFrom = buildSource(null, tree.source)
    const columns: q.AliasedColumn[] = [getNamesForSourceColumns(tree)]
        .concat(tree.joins.map(j => getNamesForJoinColumns(j, tree.rowOptions)))
        .flat()
    const joins = buildJoins(tree.source, tree.joins)
    const rowOptions = { ...tree.rowOptions, ...oneTimeRowOptions }
    const where = buildWhere(tree, rowOptions.conditions)
    const groupBy = buildGroup(tree, rowOptions.groupColumns)
    const orderBy = buildOrder(tree, rowOptions.sortColumns)
    return {
        columns,
        from: { source: selectFrom, joins },
        where,
        groupBy,
        orderBy,
    }
}

function buildSource(joinId: JoinId, source: t.SelectableNode): q.Source {
    return branchOnSelectable(
        source,
        (n: t.SourceTableNode) => ({
            type: n.type,
            name: n.table.table.key,
            as: t.getSourceAlias(joinId, n),
            columns: n.table.columns.map(c => ({ source: n.table.table.key, name: c.name })),
        }),
        (n: t.SourceViewNode) => ({
            type: n.type,
            tree: buildQueryTree(n.view),
            as: t.getSourceAlias(joinId, n),
        })
    )
}

function getNamesForSourceColumns(tree: t.ViewTree): q.AliasedColumn[] {
    return t.getSourceColumns(tree).map(c => {
        return getNamesForColumn(
            null,
            tree.source,
            maybeAddArrayAgg(c, tree.rowOptions.groupColumns)
        )
    })
}

function getNamesForColumn(
    joinId: JoinId,
    source: t.SelectableNode,
    c: ColumnInfo
): q.AliasedColumn {
    return {
        source: t.getSourceAlias(joinId, source),
        name: t.makeParentColumnKey(source, c.parentColumnId, c.name),
        as: makeColumnKey(c.id, c.name),
        outputFunc: c.outputFunc,
    }
}

/**
 * If we have a GROUP statement, then all columns that aren't part of it
 * have to be array_agged. Unless they already have a custom output function.
 */
function maybeAddArrayAgg(c: ColumnInfo, groupColumns: RowOptions["groupColumns"]): ColumnInfo {
    if (
        groupColumns.length !== 0 &&
        !c.outputFunc &&
        !groupColumns.some(
            group => group.parentColumnId === c.parentColumnId && group.joinId === c.joinId
        )
    ) {
        c.outputFunc = "ARRAY_AGG(??)"
        return c
    } else return c
}
function getNamesForJoinColumns(tree: t.JoinTree, rowOptions: RowOptions): q.AliasedColumn[] {
    const source = getJoinSource(tree)
    return t
        .getJoinColumns(tree)
        .map(c =>
            getNamesForColumn(
                tree.descriptor.id,
                source,
                maybeAddArrayAgg(c, rowOptions.groupColumns)
            )
        )
}

// Get the table keys for a join to construct the SQL query
function buildJoins(source: t.SelectableNode, joins: t.JoinTree[]) {
    return joins.map(j => buildJoin(source, j))
}

function buildJoin(source: t.SelectableNode, tree: t.JoinTree): q.Join {
    const foreignSourceNode = getJoinSource(tree)
    const sourceTableKey = t.getSourceAlias(null, source)
    const foreignTableKey = t.getSourceAlias(tree.descriptor.id, foreignSourceNode)
    const left = t.getColumnsFromNode(source).find(c => c.id === tree.descriptor.on[0])!
    const right = t.getColumnsFromNode(tree.source).find(c => c.id === tree.descriptor.on[2])!
    const leftColumnKey = t.makeParentColumnKey(source, left.id, left.name)
    const rightColumnKey = t.makeParentColumnKey(foreignSourceNode, right.id, right.name)
    const on = {
        left: {
            source: sourceTableKey,
            name: leftColumnKey,
        },
        operator: tree.descriptor.on[1],
        right: {
            source: foreignTableKey,
            name: rightColumnKey,
        },
    }
    return {
        type: getJoinType(),
        source: buildSource(tree.descriptor.id, foreignSourceNode),
        on,
        preGroup: tree.descriptor.preGroup,
    }
}

function getJoinSource(tree: t.JoinTree): t.SelectableNode {
    return tree.source
}

/** Get the type of a join (currently only left is implemented) */
function getJoinType(): JoinType {
    return JoinType.Left
}

export function buildWhere(tree: t.ViewTree, conditions: c.Condition[]): q.QueryTree["where"] {
    // as a minor convenience, the user can specify an array of conditions,
    // which are joined with AND.
    if (conditions.length === 0) return null
    else {
        const reversed = conditions.reverse()
        const sourceCondition = reversed.slice(1).reduce(
            (c1, c2) => ({
                kind: c.ConditionKind.And,
                left: c2,
                right: c1,
            }),
            reversed[0]
        )
        return buildCondition(tree, sourceCondition)
    }
}

function buildCondition(tree: t.ViewTree, c: c.Condition): q.Condition {
    return mapCondition(infix => buildInfixCondition(tree, infix), c)
}

/**
 * Go through the query tree and replace the infix conditions' column and
 * join IDs with string names for building the SQL query.
 */
function buildInfixCondition(tree: t.ViewTree, infixCond: c.InfixCondition): q.InfixCondition {
    const left = buildConditionOperand(tree, infixCond.left)
    const operator = buildOperator(infixCond.operator)
    const right = buildConditionOperand(tree, infixCond.right)
    return { kind: c.ConditionKind.Infix, left, operator, right }
}
function buildConditionOperand(tree: t.ViewTree, arg: c.Operand): q.ConditionOperand {
    switch (arg.kind) {
        case OKind.Literal:
            return arg
        case OKind.Column:
            return buildParentColumn(tree, arg.column)
        case OKind.Subquery:
            throw TypeError("not implemented")
    }
}

function buildParentColumn(tree: t.ViewTree, arg: ParentColumnSpecifier): q.ConditionOperand {
    if (arg.joinId === null) {
        const column = getColumnsFromNode(tree.source).find(c => c.id === arg.parentColumnId)!
        return {
            kind: c.OperandKind.Column,
            column: getNamesForParentColumn(arg.joinId, tree.source, column),
        }
    } else {
        const joinNode = tree.joins.find(j => j.descriptor.id === arg.joinId)!
        const column = getColumnsFromNode(joinNode.source).find(c => c.id === arg.parentColumnId)!
        return {
            kind: c.OperandKind.Column,
            column: getNamesForParentColumn(arg.joinId, joinNode.source, column),
        }
    }
}

function getNamesForParentColumn(
    joinId: JoinId,
    source: t.SelectableNode,
    column: ParentColumnDescriptor
): q.Column {
    return {
        source: getSourceAlias(joinId, source),
        name: makeParentColumnKey(source, column.id, column.name),
    }
}

function buildOperator(op: c.ConditionOperator): c.ConditionOperator {
    return op
}

/** */
function buildGroup(
    tree: t.ViewTree,
    groupColumns: RowOptions["groupColumns"]
): q.QueryTree["groupBy"] {
    return groupColumns.map(group => getParentColumn(tree, group))
}
function getParentColumn(tree: t.ViewTree, spec: ParentColumnSpecifier): q.Column {
    let source: t.SelectableNode
    if (spec.joinId === null) source = tree.source
    else {
        const join = tree.joins.find(j => j.descriptor.id === spec.joinId)!
        source = join.source
    }
    const column = t.getColumnsFromNode(source).find(c => c.id === spec.parentColumnId)!
    return {
        source: t.getSourceAlias(spec.joinId, source),
        name: t.makeParentColumnKey(source, column.id, column.name),
    }
}
function buildOrder(
    tree: t.ViewTree,
    sortColumns: RowOptions["sortColumns"]
): q.QueryTree["orderBy"] {
    return sortColumns.map(sort => ({
        column: getParentColumn(tree, sort.column),
        ...(sort.order && { order: sort.order }),
        ...(sort.nulls && { nulls: sort.nulls }),
    }))
}
