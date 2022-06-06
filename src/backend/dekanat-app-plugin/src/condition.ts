import * as c from "@intutable/lazy-views/dist/condition"
import { ParentColumnSpecifier } from "@intutable/lazy-views"

export type LeftOperand = Exclude<c.Operand, c.Literal | c.Subquery>
export type RightOperand =
    Exclude<c.Operand, ParentColumnSpecifier | c.Subquery>

export type Filter = SimpleFilter | NotFilter | AndFilter | OrFilter

export type SimpleFilter = {
    left: LeftOperand
    operator: c.InfixCondition["operator"]
    right: RightOperand
}
export type NotFilter = { not: Filter }
export type AndFilter = {
    where: Filter
    and: Filter
}
export type OrFilter = {
    where: Filter
    or: Filter
}

export type FilterOperator = {
    /**
     * The internal representation of the operator. MUST be directly usable in
     * SQL.
     */
    raw: string
    /** User-facing version of a condition operator. */
    pretty: string
}
export const FILTER_OPERATORS: FilterOperator[] = [
    { raw: "=", pretty: "=" },
    { raw: "!=", pretty: "!=" },
    { raw: "<", pretty: "<" },
    { raw: ">", pretty: ">" },
    { raw: "<=", pretty: "<=" },
    { raw: ">=", pretty: ">=" },
    { raw: "LIKE", pretty: "contains" },
]

