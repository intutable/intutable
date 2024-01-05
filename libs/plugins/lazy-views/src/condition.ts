/**
 * Types, functions, etc. for representing and interacting with selection
 * conditions on views.
 * Start reading at {@link MkCondition}.
 * @module condition
 */
import {
    Operand,
    OperandKind,
    Literal,
    ConditionOperator,
    ConditionKind,
    InfixCondition,
    IsInfixCondition,
    MkCondition,
} from "./types/condition"

import { ColumnInfo } from "./types"

export { ConditionKind, OperandKind } from "./types/condition"
export type {
    ConditionOperator,
    IsCondition,
    IsInfixCondition,
    MkCondition,
    MkInfixCondition,
    MkNotCondition,
    MkAndCondition,
    MkOrCondition,
    ParentColumnSpecifier,
    Operand,
    Literal,
    Column,
    Subquery,
    Condition,
    BooleanCondition,
    InfixCondition,
    NotCondition,
    AndCondition,
    OrCondition,
} from "./types/condition"
export { mapCondition, filterCondition } from "./internal/condition"

/** Alias for the types that can be passed into the utility function */
export type ExtendedOperand = ColumnInfo | Operand | Literal["value"]

/**
 * Utility function for constructing primitive infix-style conditions.
 * @example
 * ```
 * core.events.request(
 *     changeRowOptions(view1Id, {
 *          conditions: [
 *              and(
 *                  where(nameColumn, "IN", nameArray)
 *                  where(hiredDate, "<", "2022-07-15"),
 *              )
 *          ],
 *          groupColumns: [],
 *          sortColumns: []
 *     })
 * )
 * ```
 * ... if one were to write the above `and` expression out as objects of
 * the requisite type, the `and`, each of the `where`s, and all four
 * operands would require a kind discriminator. Barely readable.
 */
export function where(
    left: ExtendedOperand,
    operator: ConditionOperator,
    right: ExtendedOperand
): InfixCondition {
    const left_: Operand = isColumnInfo(left)
        ? {
              kind: OperandKind.Column,
              column: {
                  parentColumnId: left.parentColumnId,
                  joinId: left.joinId,
              },
          }
        : isOperand(left)
        ? left
        : { kind: OperandKind.Literal, value: left }
    const right_: Operand = isColumnInfo(right)
        ? {
              kind: OperandKind.Column,
              column: {
                  parentColumnId: right.parentColumnId,
                  joinId: right.joinId,
              },
          }
        : isOperand(right)
        ? right
        : { kind: OperandKind.Literal, value: right }
    return {
        kind: ConditionKind.Infix,
        left: left_,
        operator,
        right: right_,
    }
}

/** Utility function for negating a condition */
export function not<I extends IsInfixCondition>(condition: MkCondition<I>): MkCondition<I> {
    return {
        kind: ConditionKind.Not,
        condition,
    }
}

/** Utility function for making AND conditions. */
export function and<I extends IsInfixCondition>(
    left: MkCondition<I>,
    right: MkCondition<I>
): MkCondition<I> {
    return {
        kind: ConditionKind.And,
        left,
        right,
    }
}

/** Utility function for making OR conditions. */
export function or<I extends IsInfixCondition>(
    left: MkCondition<I>,
    right: MkCondition<I>
): MkCondition<I> {
    return {
        kind: ConditionKind.Or,
        left,
        right,
    }
}

function isOperand(o: ExtendedOperand): o is Operand {
    return typeof o === "object" && o !== null && o.hasOwnProperty("kind")
}

function isColumnInfo(o: ExtendedOperand): o is ColumnInfo {
    return (
        typeof o === "object" &&
        o !== null &&
        ["parentColumnId", "attributes", "id", "viewId", "name", "type", "key", "joinId"].every(
            prop => o.hasOwnProperty(prop)
        )
    )
}
