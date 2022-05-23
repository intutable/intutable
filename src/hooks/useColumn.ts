import { ColumnInfo, ViewDescriptor } from "@intutable/lazy-views"
import { fetcher } from "api"
import { Parser } from "api/utils"
import { TableHookOptions, useTable } from "hooks/useTable"
import { Column, TableData } from "types"

/**
 * Get the Column Info {@type {ColumnInfo}} for a specific column
 * @param {Column} forColumn
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
export const useColumn = (options?: TableHookOptions) => {
    const { data: table, error, mutate } = useTable(options)

    // TODO: the cache should be mutated differently
    // TODO: the state should be updated differently
    const createColumn = async (column: Column.Serialized): Promise<void> => {
        await fetcher({
            url: "/api/column",
            body: {
                viewId: table?.metadata.descriptor.id,
                column,
            },
        })
        await mutate()
    }

    // TODO: the cache should be mutated differently
    // TODO: the state should be updated differently
    // TODO: handle the 'alreadyTaken'-Error differently, e.g. create a dedicated error class
    // TODO: check for naming conflicts in the api route
    // TODO: get rid of `getColumnByKey`
    const renameColumn = async (
        column: Column,
        newName: Column["name"]
    ): Promise<void> => {
        if (
            table?.columns.some(c => c.key !== column.key && c.name === newName)
        )
            return Promise.reject("alreadyTaken") // instanceof IsTakenError

        await fetcher({
            url: `/api/column/${column._id!}`,
            body: { update: { displayName: newName }},
            method: "PATCH",
        })
        await mutate()
    }

    // TODO: the cache should be mutated differently
    // TODO: the state should be updated differently
    // TODO: get rid of `getColumnByKey`
    const deleteColumn = async (column: Column): Promise<void> => {
        await fetcher({
            url: `/api/column/${column._id!}`,
            body: { viewId: table!.metadata.descriptor.id },
            method: "DELETE",
        })

        await mutate()
    }

    return {
        error,
        mutate,
        createColumn,
        renameColumn,
        deleteColumn,
    }
}
