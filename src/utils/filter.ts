import * as c from "@intutable/lazy-views/dist/condition"
import {
    FilterOperator,
    FILTER_OPERATORS,
    MkFilter,
    Filter,
    SimpleFilter,
    PartialFilter,
    PartialSimpleFilter,
} from "types/filter"

/**
 * Check if a string is a valid filter operator.
 */
export const isFilterOperator = (o: string): o is FilterOperator =>
    Object.getOwnPropertyNames(FILTER_OPERATORS).includes(o)

/**
 * Convenience function for making infix conditions without having to
 * specify all the kind discriminators.
 */
export const where = (
    left: c.ParentColumnSpecifier,
    operator: FilterOperator,
    right: c.Literal["value"]
): Filter => ({
    kind: c.ConditionKind.Infix,
    left: { kind: c.OperandKind.Column, column: left },
    operator,
    right: { kind: c.OperandKind.Literal, value: right }
})
    
/**
 * Convenience function for making partial infix conditions without having to
 * specify all the kind discriminators.
 */
export const wherePartial = (
    left: c.ParentColumnSpecifier | undefined,
    operator: FilterOperator,
    right: c.Literal["value"] | undefined
): PartialFilter => ({
    kind: c.ConditionKind.Infix,
    ...(left && { left: { kind: c.OperandKind.Column, column: left }}),
    operator,
    ...(right && { right: { kind: c.OperandKind.Literal, value: right }})
})

/** Utility function for negating a condition */
export function not<I extends c.IsInfixCondition>(
    condition: MkFilter<I>
): MkFilter<I> {
    return {
        kind: c.ConditionKind.Not,
        condition,
    }
}

/** Utility function for making AND conditions. */
export function and<I extends c.IsInfixCondition>(
    left: MkFilter<I>,
    right: MkFilter<I>
): MkFilter<I> {
    return {
        kind: c.ConditionKind.And,
        left,
        right,
    }
}

/** Utility function for making OR conditions. */
export function or<I extends c.IsInfixCondition>(
    left: MkFilter<I>,
    right: MkFilter<I>
): MkFilter<I> {
    return {
        kind: c.ConditionKind.Or,
        left,
        right,
    }
}

/**
 * Compare two {@link PartialFilter}s for equality.
 */
export const partialFilterEquals = (
    f1: PartialFilter,
    f2: PartialFilter
): boolean => {
    switch(f1.kind){
        case c.ConditionKind.And:
            return f2.kind === c.ConditionKind.And &&
                partialFilterEquals(f1.left, f2.left) &&
                partialFilterEquals(f1.right, f2.right)
        case c.ConditionKind.Or:
            return f2.kind === c.ConditionKind.Or &&
                partialFilterEquals(f1.left, f2.left) &&
                partialFilterEquals(f1.right, f2.right)
        case c.ConditionKind.Not:
            return f2.kind === c.ConditionKind.Not &&
                partialFilterEquals(f1.condition, f2.condition)
        case c.ConditionKind.Infix:
            return f2.kind === c.ConditionKind.Infix &&
                partialSimpleFilterEquals(f1, f2)
        default: return false
    }
}
/**
 * Check if two {@link PartialSimpleFilter}s are equal.
 */
export const partialSimpleFilterEquals = (
    f1: PartialSimpleFilter,
    f2: PartialSimpleFilter
) =>
    f1.left?.column.parentColumnId === f2.left?.column.parentColumnId &&
    f1.left?.column.joinId === f2.left?.column.joinId &&
    f1.operator === f2.operator &&
    f1.right?.value === f2.right?.value

/**
 * Check if a {@link PartialSimpleFilter} is also a {@link SimpleFilter}
 */
export const isValidFilter = (
    filter: PartialSimpleFilter
): filter is SimpleFilter =>
    filter.left !== undefined &&
    filter.operator !== undefined &&
    filter.right !== undefined &&
    filter.right.value !== ""
