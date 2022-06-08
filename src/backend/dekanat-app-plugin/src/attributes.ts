/** Replace all booleans with 0 or 1 in a given type. */
export type SqlData<A> =
    A extends boolean
    ? number
    : A extends Object
    ? { [k in keyof A]: A[k] extends boolean ? number : A[k] }
    : A

/** Replace all booleans with 0 or 1 in a given value. */
export function toSQL(
    obj: boolean | Object | any
): SqlData<typeof obj> {
    if (typeof(obj) === "boolean")
        return (obj ? 1 : 0) as number
    else if (obj instanceof Object)
        return Object.getOwnPropertyNames(obj).reduce(
            (acc, prop) => Object.assign(acc, { [prop]: toSQL(obj[prop]) }),
            {} as Object
        )
    else return obj
}
