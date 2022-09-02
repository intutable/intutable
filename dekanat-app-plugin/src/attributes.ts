/** Replace all booleans with 0 or 1 in a given type. */
export type SqlData<A> = A extends boolean
    ? number
    : A extends Record<string, unknown>
    ? { [k in keyof A]: A[k] extends boolean ? number : SqlData<A[k]> }
    : A

/** Replace all booleans with 0 or 1 in a given value. */
export function toSql(obj: boolean): number
export function toSql(
    obj: Record<string, unknown>
): Record<string, Exclude<unknown, boolean>>
export function toSql(
    obj: boolean | Record<string, unknown> | unknown
): SqlData<typeof obj> {
    if (typeof obj === "boolean") return obj ? 1 : 0
    else if (typeof obj === "object" && obj !== null)
        return Object.getOwnPropertyNames(obj).reduce(
            (acc, prop) =>
                Object.assign(acc, {
                    [prop]: toSql(obj[prop as keyof typeof obj]),
                }),
            {}
        )
    else return obj
}

export const A = {
    COLUMN_INDEX: {
        key: "__columnIndex__",
    },
}
