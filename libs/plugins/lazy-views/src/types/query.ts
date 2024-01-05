import { JoinType, ConditionOperator, SortOrder, NullsPosition } from "."
import * as c from "./condition"
import { Selectable } from "./selectable"

export { JoinType, SortOrder }
export type { ConditionOperator }

/** A simplified syntax tree for an SQL query. */
export interface QueryTree {
    columns: AliasedColumn[]
    from: From
    where: Condition | null
    groupBy: Column[]
    orderBy: OrderColumn[]
}

/** SELECT clause */
/**
 * A column in a query. Used only for joining and sorting; the actual selected
 * columns are made from {@link AliasedColumn}
 */
export interface Column {
    source: string
    name: string
}

/**
 * A column with an alias and, optionally, a (SQL) function to modify it.
 * Converted to a query (with no function), it would look like
 * @example
 * `${column.source}.${column.name} AS ${column.alias}`
 * An example of a function would be `"ARRAY_AGG(??)` or `"?? + ??"`, where
 * the column's name is inserted instead of the question marks.
 */
export interface AliasedColumn extends Column {
    as: string
    outputFunc?: string
}

/** FROM clause */
/** The FROM clause of a query. */
export interface From {
    source: Source
    joins: Join[]
}

/**
 * Selectable instance for tables and views in queries. In the simplest case
 * ({@link SourceTable}) consists only of a table name and an alias, but
 * can also contain a full subquery.
 */
export interface Source extends Selectable<SourceTable, SourceView> {
    as: string
}
/** FROM clause for a simple table. */
export interface SourceTable extends Source {
    name: string
    columns: Column[]
}
/** FROM clause for a view. */
export interface SourceView extends Source {
    tree: QueryTree
}

/** A join. Consists of a type, a source (table or view) */
export interface Join {
    type: JoinType
    source: Source
    on: On
    preGroup: boolean
}
/** ON clause for a join. */
export interface On {
    left: OnLeft
    operator: ConditionOperator
    right: OnRight
}
/**
 * {@link OnLeft} and {@link OnRight} are the left and right operands in a
 * join's on clause. For now, they are plain columns, but that will change
 * e.g. when we introduce the "ON x IN ... " condition.
 */
export type OnLeft = Column
/**
 * {@link OnLeft} and {@link OnRight} are the left and right operands in a
 * join's on clause. For now, they are plain columns, but that will change
 * e.g. when we introduce the "ON x IN ... " condition.
 */
export type OnRight = Column

/** WHERE clauses/conditions */

/**
 * A condition of a WHERE clause.
 */
export type Condition = c.MkCondition<InfixCondition>
export type InfixCondition = c.MkInfixCondition<
    ConditionOperand,
    c.ConditionOperator,
    ConditionOperand
>
export type NotCondition = c.MkNotCondition<c.MkCondition<InfixCondition>>
export type AndCondition = c.MkAndCondition<c.MkCondition<InfixCondition>>
export type OrCondition = c.MkOrCondition<c.MkCondition<InfixCondition>>

/** A column used as an operand in a condition (WHERE clause) */
export type ColumnOperand = {
    kind: c.OperandKind.Column
    column: Column
}
export type ConditionOperand = c.Literal | ColumnOperand | c.Subquery

/** A column on which to order a result set. */
export interface OrderColumn {
    column: Column
    order?: SortOrder
    nulls?: NullsPosition
}
