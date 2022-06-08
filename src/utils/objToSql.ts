/**
 * Go through an object and convert all of its boolean values to 0 | 1
 * for storage in a database.
 */
export const objToSql = (
    obj: Record<string, unknown>
): Record<string, unknown> => {
    return Object.getOwnPropertyNames(obj).reduce((acc, key) => {
        const val = obj[key]
        if (typeof val === "boolean") acc[key] = val ? 1 : 0
        else acc[key] = val
        return acc
    }, {} as Record<string, unknown>)
}
