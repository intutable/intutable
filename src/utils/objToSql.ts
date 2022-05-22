export default function objToSql(
    obj: Record<string, unknown>
): Record<string, unknown> {
    return Object.getOwnPropertyNames(obj)
        .reduce(
            (acc, key) => {
                const val = obj[key]
                if (typeof(val) === "boolean")
                    acc[key] = val ? 1 : 0
                else
                    acc[key] = val
                return acc
            },
            {} as Record<string, unknown>
        )
}
