/**
 * This module defines a limited subset of the view plugin's condition type
 * for use in the GUI.
 */
import * as c from "@intutable/lazy-views/dist/condition"
import { ColumnInfo } from "@intutable/lazy-views/dist/types"

export {
    ConditionKind,
    OperandKind,
} from "@intutable/lazy-views/dist/condition"
export type { Column, Literal } from "@intutable/lazy-views/dist/condition"

/**
 * A primitive infix-type (column = value, column < value, etc.) filter.
 */
export type SimpleFilter = c.MkInfixCondition<
    LeftOperand,
    FilterOperator,
    RightOperand
>
/**
 * The left operand to a filter may only be a column (for now).
 */
export type LeftOperand = Exclude<c.Operand, c.Literal | c.Subquery>
/**
 * The right operand to a filter may only be a literal value (for now)
 */
export type RightOperand = Exclude<c.Operand, c.Column | c.Subquery>

export type FilterOperator = keyof FilterOperatorMap

/**
 * A map of all available filter infix operators with some
 * {@link OperatorDescriptor | properties}.
 */
export type FilterOperatorMap = {
    "=":  { pretty: "=" },
    "!=": { pretty: "!=" },
    "<":  { pretty: "<" },
    ">":  { pretty: ">" },
    "<=": { pretty: "<=" },
    ">=": { pretty: ">=" },
    LIKE: { pretty: "contains" },
}

/**
 * Describes an infix operator
 */
export type OperatorDescriptor = {
    /**
     * @prop {FilterOperator} raw The operator in SQL, passed to the LV plugin
     * directly
     */
    raw: FilterOperator
    /**
     * @prop {string} pretty The operator's pretty version, e.g. "contains"
     * instead of "LIKE".
     */
    pretty: string
}
/**
 * {@link FilterOperatorMap}, but as a value, so we can iterate over it, etc.
 */
export const FILTER_OPERATORS: FilterOperatorMap = {
    "=":  { pretty: "=" },
    "!=": { pretty: "!=" },
    "<":  { pretty: "<" },
    ">":  { pretty: ">" },
    "<=": { pretty: "<=" },
    ">=": { pretty: ">=" },
    LIKE: { pretty: "contains" },
}
export const FILTER_OPERATORS_LIST: OperatorDescriptor[] =
    (Object.getOwnPropertyNames(FILTER_OPERATORS) as FilterOperator[]).map(
        name => ({ ...(FILTER_OPERATORS[name]), raw: name })
    )


/**
 * Had to re-create this function for our constrained subtype. But at least
 * the and, or, and not builders will still work.
 * TODO somehow make LV.condition.where parameterizable enough that we can
 * re-use it here.
 */
export function where(
    left: ColumnInfo | c.ParentColumnSpecifier,
    operator: FilterOperator,
    right: c.Literal["value"]
): SimpleFilter {
    return {
        kind: c.ConditionKind.Infix,
        left: {
            kind: c.OperandKind.Column,
            column: left,
        },
        operator,
        right: { kind: c.OperandKind.Literal, value: right },
    }
}


/**
 * The (string) `contains` operator uses SQL `LIKE` under the hood,
 * which requires a pattern string, so we need to convert back and forth.
 */
export const LIKE_PATTERN_ESCAPE_CHARS = ["%", "_", "\\"]

/**
 * Convert the value a user enters in a `contains` condition to an SQL
 * pattern string (adding percent symbols, escaping special characters)
 */
export const packContainsValue = (value: string): string =>
    "%" +
    value
        .split("")
        .map(c => (LIKE_PATTERN_ESCAPE_CHARS.includes(c) ? "\\" + c : c))
        .join("") +
    "%"

/**
 * Parse the SQL `LIKE` pattern into a format without format and escape chars.
 */
export const unpackContainsValue = (value: string): string => {
    let acc = ""
    let lastWasBackslash = false
    const pos = 0
    for (const char of value.split("").slice(1, -1)) {
        if (!lastWasBackslash && char === "\\") {
            // saw a first backslash
            lastWasBackslash = true
        } else if (
            lastWasBackslash &&
            LIKE_PATTERN_ESCAPE_CHARS.includes(char)
        ) {
            // saw a backslash, now seeing \ % _
            lastWasBackslash = false
            acc = acc.concat(char)
        } else if (lastWasBackslash)
            // saw backslash, but not seeing an escapeable character after
            throw Error(
                `unpackContainsValue: unescaped \\ at ` + `position ${pos}`
            )
        else if (LIKE_PATTERN_ESCAPE_CHARS.includes(char))
            // seeing escapeable character without a backslash before it
            throw Error(
                `unpackContainsValue: unescaped ${char} at ` + `position ${pos}`
            )
        else acc = acc.concat(char)
    }
    return acc
}
