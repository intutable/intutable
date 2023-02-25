export type UnorderedListCellContentItem<T> = {
    value: string | UnorderedListCellContentItem<T>[] // <- raw value
    url?: string
    props?: T // <- additional data goes here
}

export type UnorderedListCellContent<T = undefined> = {
    format?: { cellType: string }
    items: UnorderedListCellContentItem<T>[]
}
