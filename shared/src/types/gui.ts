/**
 * Cell content (data of an individual row:column pair) for backward links and lookups.
 * Since they represent a 1:n mapping between rows, their cells will contain multiple values.
 * These, in turn, are formatted with the CellType of the column that the backward link/lookup
 * is based on.
 * @type T additional props that the items may have.
 * @prop { {cellType: string} } format formatting info. Currently contains the cell type
 * that the individual items should be formatted with.
 * @prop {BackwardLinkCellContentItem<T>[]} items The list items.
 */
export type BackwardLinkCellContent<T = undefined> = {
    format?: { cellType: string }
    items: BackwardLinkCellContentItem<T>[]
}

/**
 * An individual item in a {@link BackwardLinkCellContent} list. The lists can be nested,
 * in which case all items have the same type and format, represented by the list's
 * `format` property.
 * @prop {string | undefined} url URL for turning individual content items into links.
 * Currently unused.
 * @prop {T} props optional additional properties.
 */
export type BackwardLinkCellContentItem<T> = {
    value: string | BackwardLinkCellContentItem<T>[] // <- raw value
    url?: string
    props?: T // <- additional data goes here
}
