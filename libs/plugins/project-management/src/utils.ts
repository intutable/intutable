export function singleValue<T>(query: Record<string, T>[]): T {
    const values = Object.values(query[0])

    if (query.length > 1 || values.length > 1) {
        throw new Error(`Cannot extract single value from ${query}`)
    }

    return values[0]
}

export function generateTableKey(
    projectId: number | [],
    tableName: string
): string {
    return `p${projectId}_${tableName}`
}
