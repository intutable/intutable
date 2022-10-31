import type { MetaColumnProps, Row as _Row } from "./base"

// Note: These types, describing data in a special state, should not be imported into the frontend's scope
// The namespace is exported only for module augmentation
export namespace DB {
    export type Boolean = 0 | 1
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
        isUserPrimaryKey: DB.Boolean
        kind: string
        cellType: string
        displayName: string
        index: number
        isInternal: DB.Boolean
        editable?: DB.Boolean | null
        width?: string | null
        minWidth?: string | null
        maxWidth?: string | null
        cellClass?: string | null
        headerCellClass?: string | null
        summaryCellClass?: string | null
        summaryFormatter?: string | null
        groupFormatter?: string | null
        colSpan?: string | null
        frozen?: DB.Boolean | null
        resizable?: DB.Boolean | null
        sortable?: DB.Boolean | null
        sortDescendingFirst?: DB.Boolean | null
    }
    /**
     * // TODO: `__rowIndex` is currently not saved in the db, although the backend
     * has its own row ordering mechanism. Will be changed in the future
     */
    export type Row = Omit<_Row, "index">

    /** Combines Column with ColumnInfo | Leftover of bad design, we'll fix this in the future and combine both */
    export namespace Restructured {
        /** Some renamed props and other information included from `MetaColumnProps` */
        export type Column = Omit<
            MetaColumnProps,
            "isUserPrimaryKey" | "isInternal" // redefined type below
        > &
            Omit<
                DB.Column,
                | "displayName" // `name` instead
                | "kind" // included in `MetaColumnProps`
                | "cellType" // included in `MetaColumnProps`
                | "index" // included in `MetaColumnProps`
                | "isUserPrimaryKey" // included in `MetaColumnProps`
                | "isInternal" // included in `MetaColumnProps`
            > & {
                key: string // information from `ColumnInfo`
                name: string // rename displayName
                // from `MetaColumnProps`
                isUserPrimaryKey: DB.Boolean
                isInternal: DB.Boolean
            }
        /** Row with its index */
        export type Row = _Row
    }
}
