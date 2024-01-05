/** Creates a name for tables that were created for imported persons. */

export const createTableName = (): string => {
    const date = new Date()
    const formattedDate = date.toLocaleString("de-DE") // this prevents duplicate names
    return `Importierte Personen (${formattedDate})`
}
