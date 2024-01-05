/**
 * Module for converting a [QueryTree]{@link Q.QueryTree} to a raw SQL string.
 *
 * @packageDocumentation
 */
import { knex, Knex } from "knex"
import { branchOnSelectable } from "../selectable"
import * as q from "../../types/query"
import { ConditionKind, OperandKind } from "../../types/condition"

type Builder = Knex.QueryBuilder

/**
 * Make a query from a {@link Q.QueryTree}. Uses Knex and returns a query
 * with bindings.
 */
export function makeQuery(query: q.QueryTree): Knex.Sql {
    const builder = makeSubquery(query)
    const rawQuery = builder.toSQL()
    return rawQuery
}

function makeSubquery(query: q.QueryTree): Builder {
    // we actually do need a new knex instance for each new subquery, or else
    // it gets stuck in an infinite loop.
    const knexer = knex({ client: "pg" })
    let builder = columns(knexer, query.columns)
    builder = fromAll(builder, query.from)
    builder = where(builder, query.where)
    builder = groupBy(builder, query.groupBy)
    builder = orderBy(builder, query.orderBy)
    return builder
}

function columns(builder: Knex, columns: q.AliasedColumn[]): Builder {
    return builder.select(columns.map(makeColumnString))
}

function makeColumnString(c: q.AliasedColumn): string | Knex.Raw {
    const key = getColumnKey(c)
    if (c.outputFunc) {
        const bindingsInExpression = c.outputFunc.match(/\?\?/g)
        const numBindings = (bindingsInExpression ? bindingsInExpression.length : 0) + 1
        const bindings = Array(numBindings).fill(key)
        bindings[bindings.length - 1] = c.as
        return knex({ client: "pg" }).raw(`${c.outputFunc} AS ??`, bindings)
    } else return `${key} AS ${c.as}`
}

function getColumnKey(c: q.Column): string {
    return `${c.source}.${c.name}`
}

function fromAll(builder: Builder, from: q.From): Builder {
    builder = builder.from(fromSingle(from.source))
    for (const join of from.joins) {
        let sourceString: string | Knex.QueryBuilder<any, any>
        if (join.preGroup) {
            sourceString = fromGroup(join.source, join.on)
        } else {
            sourceString = fromSingle(join.source)
        }
        const joinType = getJoinType(join.type)
        const onClause = on(join.on)
        builder = builder[joinType](sourceString, function () {
            this.on(...onClause)
        }).as(join.source.as)
    }
    return builder
}

function fromSingle(source: q.Source) {
    return branchOnSelectable(
        source,
        (f: q.SourceTable) => `${f.name} AS ${f.as}`,
        (f: q.SourceView) => makeSubquery(f.tree).as(source.as)
    )
}

// @ts-ignore
function getJoinType(t: q.JoinType): "leftJoin" | "innerJoin" | "rightJoin" | "fullOuterJoin" {
    switch (t) {
        // @ts-ignore
        case q.JoinType.Left:
            return "leftJoin"
    }
}

function on(on: q.On): [string, string, string] {
    const left = `${on.left.source}.${on.left.name}`
    const right = `${on.right.source}.${on.right.name}`
    return [left, on.operator, right]
}

function where(builder: Builder, c: q.QueryTree["where"]): Builder {
    if (!c) return builder
    else {
        switch (c.kind) {
            case ConditionKind.Boolean:
                return builder.where(c.value)
            case ConditionKind.Infix:
                return infixCondition(builder, c)
            case ConditionKind.Not:
                return notCondition(builder, c)
            case ConditionKind.And:
                return andCondition(builder, c)
            case ConditionKind.Or:
                return orCondition(builder, c)
        }
    }
}

function infixCondition(builder: Builder, c: q.InfixCondition): Builder {
    // get weird type errors without these anies.
    return builder.where(
        buildConditionOperand(c.left) as any,
        c.operator,
        buildConditionOperand(c.right) as any
    )
}

function buildConditionOperand(c: q.ConditionOperand) {
    switch (c.kind) {
        case OperandKind.Literal:
            return c.value
        case OperandKind.Column:
            return knex({ client: "pg" }).ref(getColumnKey(c.column))
        case OperandKind.Subquery:
            throw Error("buildConditionOperand: subquery not implemented")
    }
}

function notCondition(builder: Builder, c: q.NotCondition): Builder {
    return builder.whereNot(function () {
        where(this, c.condition)
    })
}

function andCondition(builder: Builder, c: q.AndCondition): Builder {
    return where(builder, c.left).andWhere(function () {
        where(this, c.right)
    })
}

function orCondition(builder: Builder, c: q.OrCondition): Builder {
    return where(builder, c.left).orWhere(function () {
        where(this, c.right)
    })
}

function groupBy(builder: Builder, groupColumns: q.QueryTree["groupBy"]): Builder {
    if (groupColumns.length === 0) return builder
    else return builder.groupBy(groupColumns.map(group => getColumnKey(group)))
}

function orderBy(builder: Builder, sortColumns: q.OrderColumn[]): Builder {
    return builder.orderBy(
        sortColumns.map(c => ({
            column: getColumnKey(c.column),
            ...(c.order && { order: c.order }),
            ...(c.nulls && { nulls: c.nulls }),
        }))
    )
}

function fromGroup(source: q.Source, on: q.On): string | Knex.QueryBuilder<any, any> {
    return branchOnSelectable(
        source,
        (f: q.SourceTable) => groupTableQuery(f, on),
        (f: q.SourceView) => makeGroupedSubquery(f.tree, f.as, on)
    )
}

function groupTableQuery(table: q.SourceTable, on: q.On) {
    const knexer = knex({ client: "pg" })
    const keyColumn = knexer.raw(`"${on.right.name}"`)
    const aggregatedArrays = table.columns
        .filter(c => c.name !== on.right.name)
        .map(col => knexer.raw(`ARRAY_AGG("${col.name}") AS "${col.name}"`))
    return knexer
        .select([keyColumn].concat(aggregatedArrays))
        .from(table.name)
        .groupBy(on.right.name)
        .as(table.as)
}

function makeGroupedSubquery(query: q.QueryTree, alias: string, on: q.On): Builder {
    const knexer = knex({ client: "pg" })
    const keyColumn = knexer.raw(`"${on.right.name}"`)
    const aggregatedArrays = query.columns
        .filter(col => col.as !== on.right.name)
        .map(col => knexer.raw(`ARRAY_AGG("${col.as}") AS "${col.as}"`))
    return knexer
        .select([keyColumn].concat(aggregatedArrays))
        .from(makeSubquery(query).as(alias))
        .groupBy(on.right.name)
        .as(alias)
}
