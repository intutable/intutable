/**
 * Conditions for filtering result sets (cf. SQL `WHERE` clauses).
 * Start reading at {@link MkCondition}.
 * @module types.condition
 */
import { ParentColumnSpecifier, ConditionOperator } from "."

export type { ParentColumnSpecifier, ConditionOperator } from "."

/**
 * Kinds of condition: trivial boolean, infix (`column1 = 'b'`,
 * `column2 IN ['d','e']`, etc.), negation (of any other condition),
 * `AND` and `OR` (also of sub-conditions)
 * In order to keep things serializable, we use tagged unions instead of
 * classes here.
 */
export enum ConditionKind {
    Boolean,
    Infix,
    Not,
    And,
    Or,
}

/**
 * Kinds of operand to an infix condition: literal values, column references,
 * and subqueries.
 */
export enum OperandKind {
    Literal,
    Column,
    Subquery,
}

/**
 * A condition can be a tree of AND, OR, NOT nodes with primitive kind of
 * predicates that directly compare values. Since they're (almost?) always
 * in infix form in SQL, we call them "infix" conditions.
 */
export type IsInfixCondition = { kind: ConditionKind.Infix }

/** Supertype for all condition types. */
export type IsCondition = { kind: ConditionKind }

/**
 * A condition on a query (view). May consist of a tree of `AND`, `OR`, and
 * `NOT` nodes. Leaf nodes are either {@link BooleanCondition}s (largely
 * useless), or _infix_ conditions, (e.g. `user_name='LemongrabThree'`).
 * Why is the infix type left open as a type parameter?
 * To allow client code to declare constrained subsets. For instance,
 * if your code does not allow conditions with subqueries, it is a
 * hassle to have to manually check in every function that there
 * are no subquery-type operands, or write your own conversion functions.
 * This way, simply declare your `MyInfixCondition` type (should be a subset of
 * {@link InfixCondition}), then declare
 *`type MyCondition = MkCondition<MyInfixCondition>`, and you can
 * just pass your data type into this library's functions.
 *
 * To only allow certain _condition_ kinds (e.g. exclude `AND` and `OR`, but
 * allow `NOT`) you must create your own sum type _instead_ of `MkCondition`,
 * whose options are based on {@link MkNotCondition}, {@link MkAndCondition},
 * and {@link MkOrCondition} and are mutually recursive with it.
 *
 * @example
 * ```
 * type YesOrNoCondition
 *     = InfixCondition
 *     | MkNotCondition<YesOrNoCondition> // mutual recursion here
 * ```
 *
 * @typeParam {{ kind: ConditionKind.Infix }} Infix
 */
export type MkCondition<Infix extends IsInfixCondition> =
    | BooleanCondition
    | Infix
    | MkNotCondition<MkCondition<Infix>>
    | MkAndCondition<MkCondition<Infix>>
    | MkOrCondition<MkCondition<Infix>>

/** A trivial boolean condition */
export interface BooleanCondition {
    kind: ConditionKind.Boolean
    value: boolean
}

/**
 * A basic infix operator condition (=, <, IN, ...)
 * @example
 * ```
 * { left: { parentColumnId: 12, joinId: 8 },
 *   operator: "<",
 *   32 }
 * // <~=> WHERE j8_tableName.c12_columnName<32
 * Parameterized over all three props to allow client code to specify
 * constrained subsets of possible conditions without having to manually
 * convert everything all the time. This library itself only uses
 * {@link InfixCondition}
 * ```
 * @typeParam L the left operand to the condition.
 * @typeParam O the allowed operators.
 * @typeParam R the right operand to the condition.
 */
export type MkInfixCondition<L, O, R> = {
    kind: ConditionKind.Infix
    left: L
    operator: O
    right: R
}

/**
 * Possible types of operand to a condition clause:
 * literals, column references, and subqueries.
 */
export type Operand = Literal | Column | Subquery

/** Types of literal value that can be operands in a condition. */
export type Literal = {
    kind: OperandKind.Literal
    value: boolean | number | bigint | string | boolean[] | number[] | bigint[] | string[]
}

/** A column reference passed as an operand to a condition. */
export type Column = {
    kind: OperandKind.Column
    column: ParentColumnSpecifier
}

/** A subquery as a condition operand. */
export type Subquery = {
    kind: OperandKind.Subquery
    /** not yet implemented. */
    implemented: false
}

/**
 * A negated condition.
 * @typeParam Condition the kind(s) of condition that the child node
 * should be able to have.
 */
export interface MkNotCondition<Condition extends IsCondition> {
    kind: ConditionKind.Not
    /** The condition to negate; rows fulfilling it will be filtered _out_. */
    condition: Condition
}

/**
 * An AND condition. The linked-list-like structure is a compromise:
 * it is hierarchical JSON, but it reads somewhat like SQL.
 * @typeParam Condition the kind(s) of condition that the children of
 * the AND should be able to have.
 */
export interface MkAndCondition<Condition extends IsCondition> {
    kind: ConditionKind.And
    /** Left side. */
    left: Condition
    /** Right side. */
    right: Condition
}
/**
 * An OR condition. The linked-list-like structure is a compromise:
 * it is hierarchical JSON, but it reads somewhat like SQL.
 * @typeParam Condition the kind(s) of condition that the children of
 * the OR should be able to have.
 */
export interface MkOrCondition<Condition extends IsCondition> {
    kind: ConditionKind.Or
    /** Left side */
    left: Condition
    /** Right side */
    right: Condition
}

/** Infix condition that allows all kinds of operands and operators. */
export type InfixCondition = MkInfixCondition<Operand, ConditionOperator, Operand>
/** General-purpose condition. */
export type Condition = MkCondition<InfixCondition>

export type NotCondition = MkNotCondition<MkCondition<InfixCondition>>
export type AndCondition = MkAndCondition<MkCondition<InfixCondition>>
export type OrCondition = MkOrCondition<MkCondition<InfixCondition>>
