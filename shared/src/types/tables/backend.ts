import type { MetaColumnProps, Row as _Row } from "./base"

// Note: These types, describing data in a special state, should not be imported into the frontend's scope
// The namespace is exported only for module augmentation
export namespace DB {
    /**
     * This is how the data is saved in the sql based database.
     * Actually everything is saved as a string, even other primitives.
     *
     * It's the type of {@link ColumnInfo.attributes},
     * that was mistakenly implemented wihtout any type information.
     *
     * We use modul augmentation to add the type information
     * in `/types/module-augmenation/lazy-views.ts`.
     */
    export type Column = {
        _kind: string
        _cellContentType: string
        __columnIndex__: number | null
        userPrimary: 0 | 1
        displayName: string
        editable?: 1 | 0 | null
        width?: string | null
        minWidth?: string | null
        maxWidth?: string | null
        cellClass?: string | null
        headerCellClass?: string | null
        summaryCellClass?: string | null
        summaryFormatter?: string | null
        groupFormatter?: string | null
        colSpan?: string | null
        frozen?: 1 | 0 | null
        resizable?: 1 | 0 | null
        sortable?: 1 | 0 | null
        sortDescendingFirst?: 1 | 0 | null
        headerRenderer?: string | null // TODO: remove from DB
    }
    /**
     * // TODO: `__rowIndex` is currently not saved in the db, although the backend
     * has its own row ordering mechanism. Will be changed in the future
     */
    export type Row = Omit<_Row, "index">

    /** Combines Column with ColumnInfo | Leftover of bad design, we'll fix this in the future and combine both */
    export namespace Restructured {
        /** Some renamed props and other information included */
        export type Column = Omit<MetaColumnProps, "isPrimaryKey"> &
            Omit<
                DB.Column,
                | "headerRenderer"
                | "displayName"
                | "_kind"
                | "_cellContentType"
                | "__columnIndex__"
                | "userPrimary"
            > & {
                key: string
                name: string
                // from `MetaColumnProps`
                isPrimaryKey: 0 | 1
            }
        /** Row with its index */
        export type Row = _Row
    }
}
