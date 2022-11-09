import { ColumnInfo } from "@intutable/lazy-views"
import { fetcher } from "api"
import { TableHookOptions, useTable } from "hooks/useTable"
import { useView, ViewHookOptions } from "hooks/useView"
import { Column } from "types"

import { CustomColumnAttributes } from "@shared/types"
import { ColumnFactory } from "utils/ColumnFactory"

export type { StandardColumnSpecifier } from "@shared/types"

type Column = Column.Deserialized

/**
 * Get the Column Info {@type {ColumnInfo}} for a column. Pass in a RDG column
 * (only has RDG-relevant metadata) to get its full metadata.
 * @param {ColumnInfo[]} columns the meta columns of the table
 * @param {Column} forColumn the RDG column.
 * @returns {ColumnInfo}
 *
 * @deprecated
 */
export const getColumnInfo = (
    columns: ColumnInfo[],
    forColumn: Column
): ColumnInfo => {
    const columnInfo = columns.find(c => c.key === forColumn.key)
    if (!columnInfo)
        throw Error(`Could not find Column Info for column: ${forColumn}`)
    return columnInfo
}

/**
 * ### useColumn hook.
 *
 * Provides methods for manipulating columns of a table.
 *
 * It uses the {@link APIContextProvider}
 * to determine the current selected table.
 *
 * @param {Partial<PublicConfiguration<TableData, any, BareFetcher<TableData>>>} [options.swrOptions] Options for the underlying {@link useSWR} hook.
 *
 * @param {ViewDescriptor} [options.table] If you want to fetch a diffrent table than specified in the api context, you can use this option.
 */
export const useColumn = (
    tableOptions?: TableHookOptions,
    viewOptions?: ViewHookOptions
) => {
    const { data: table, mutate: mutateTable } = useTable(tableOptions)
    const { data: view, mutate: mutateView } = useView(viewOptions)
    const mutate = async () => {
        await mutateTable()
        await mutateView()
    }

    /** Find a column in the base table given a column of a view. */
    const getTableColumn = (
        column: Column.Serialized | Column.Deserialized
    ): ColumnInfo | null => {
        const viewColumn = view?.metaColumns.find(c => c.key === column.key)
        const tableColumn = table?.metadata.columns.find(
            c => c.id === viewColumn?.parentColumnId
        )
        if (!tableColumn) return null
        return tableColumn
    }

    // TODO: the cache should be mutated differently
    // TODO: the state should be updated differently
    const createColumn = async (column: ColumnFactory): Promise<void> => {
        const tableId = table!.metadata.descriptor.id

        const newColumn = column.create()

        await fetcher({
            url: `/api/table/${tableId}/column`,
            body: { newColumn },
        })
        await mutate()
    }

    // TODO: the cache should be mutated differently
    // TODO: the state should be updated differently
    const renameColumn = async (
        column: Column,
        newName: Column["name"]
    ): Promise<void> => {
        const tableId = table!.metadata.descriptor.id
        const baseColumn = getTableColumn(column)
        await fetcher({
            url: `/api/table/${tableId}/column/${baseColumn!.id}/rename`,
            body: { newName },
            method: "PATCH",
        })
        await mutate()
    }

    // TODO: the cache should be mutated differently
    // TODO: the state should be updated differently
    const changeAttributes = async (
        column: Column,
        update: CustomColumnAttributes
    ): Promise<void> => {
        const tableId = table!.metadata.descriptor.id
        const baseColumn = getTableColumn(column)
        await fetcher({
            url: `/api/table/${tableId}/column/${baseColumn!.id}`,
            body: { update },
            method: "PATCH",
        })
        await mutate()
    }

    // TODO: the cache should be mutated differently
    // TODO: the state should be updated differently
    // TODO: get rid of `getColumnByKey`
    const deleteColumn = async (
        column: Column.Serialized | Column.Deserialized
    ): Promise<void> => {
        const tableId = table!.metadata.descriptor.id
        const tableColumn = getTableColumn(column)
        await fetcher({
            url: `/api/table/${tableId}/column/${tableColumn!.id}`,
            body: { tableId: table!.metadata.descriptor.id },
            method: "DELETE",
        })

        await mutate()
    }

    return {
        mutate,
        getTableColumn,
        createColumn,
        renameColumn,
        changeAttributes,
        deleteColumn,
    }
}
