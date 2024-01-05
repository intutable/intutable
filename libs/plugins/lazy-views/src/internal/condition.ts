import { ParentColumnId } from "../types/main"
import * as c from "../types/condition"

export * from "../types/condition"

/**
 * Transform a condition with a function to apply to infix conditions.
 */
export function mapCondition<I1 extends c.IsInfixCondition, I2 extends c.IsInfixCondition>(
    f: (infixCondition: I1) => I2,
    condition: c.MkCondition<I1>
): c.MkCondition<I2> {
    switch (condition.kind) {
        case c.ConditionKind.Boolean:
            return condition
        case c.ConditionKind.Infix:
            return f(condition)
        case c.ConditionKind.Not:
            return {
                kind: condition.kind,
                condition: mapCondition(f, condition.condition),
            }
        case c.ConditionKind.And:
        case c.ConditionKind.Or:
            return {
                kind: condition.kind,
                left: mapCondition(f, condition.left),
                right: mapCondition(f, condition.right),
            }
    }
}

/**
 * Transform a condition with a predicate to apply to an infix condition. All infix condition
 * nodes that do not match the condition will be pruned. AND and OR conditions will be reduced
 * to an infix if exactly one of their branches passes the predicate. AND, OR, and NOT nodes will
 * be reduced to null if all their branches fail the predicate, so it is possible for the function
 * to return null.
 */
export function filterCondition<I extends c.IsInfixCondition>(
    f: (infixCondition: I) => boolean,
    condition: c.MkCondition<I>
): c.MkCondition<I> | null {
    switch (condition.kind) {
        case c.ConditionKind.Boolean:
            return condition
        case c.ConditionKind.Infix:
            return f(condition) ? condition : null
        case c.ConditionKind.Not:
            const maybeCondition = filterCondition(f, condition.condition)
            return maybeCondition === null
                ? null
                : { kind: condition.kind, condition: maybeCondition }
        case c.ConditionKind.And:
        case c.ConditionKind.Or:
            const maybeLeft = filterCondition(f, condition.left)
            const maybeRight = filterCondition(f, condition.right)
            if (maybeLeft !== null && maybeRight !== null)
                return { kind: condition.kind, left: maybeLeft, right: maybeRight }
            else if (maybeRight !== null) return maybeRight
            else if (maybeLeft !== null) return maybeLeft
            else return null
    }
}

export function cleanCondition(
    columnId: ParentColumnId,
    condition: c.Condition
): c.Condition | null {
    return filterCondition(
        infixCondition => !infixConditionInvolvesColumn(columnId, infixCondition),
        condition
    )
}
function infixConditionInvolvesColumn(
    columnId: ParentColumnId,
    condition: c.InfixCondition
): boolean {
    const leftColumnIsTheOne =
        condition.left.kind === c.OperandKind.Column &&
        condition.left.column.parentColumnId === columnId
    const rightColumnIsTheOne =
        condition.right.kind === c.OperandKind.Column &&
        condition.right.column.parentColumnId === columnId
    return leftColumnIsTheOne || rightColumnIsTheOne
}
