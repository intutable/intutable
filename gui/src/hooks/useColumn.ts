import { fetcher } from "api"
import { TableHookOptions, useTable } from "hooks/useTable"
import { useView, ViewHookOptions } from "hooks/useView"
import { Column } from "types"

import { CustomColumnAttributes } from "@shared/types"
import { StandardColumnSpecifier } from "@backend/types/requests"
import { ColumnFactory, SettableColumnProps } from "utils/column utils/ColumnFactory"

type Column = Column.Deserialized

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
export const useColumn = (tableOptions?: TableHookOptions, viewOptions?: ViewHookOptions) => {
    const { data: table, mutate: mutateTable } = useTable(tableOptions)
    const { data: view, mutate: mutateView } = useView(viewOptions)
    const mutate = async () => {
        await mutateTable()
        await mutateView()
    }

    /** Find a column in the base table given a column of a view. */
    const getTableColumn = (
        forColumn: Column.Serialized | Column.Deserialized
    ): Column.Serialized | null => {
        if (view == null || table == null) return null

        const tableColumn = table.columns.find(column => column.id === forColumn.parentColumnId)

        return tableColumn ?? null
    }

    // TODO: the cache should be mutated differently
    // TODO: the state should be updated differently
    const createColumn = async (column: ColumnFactory): Promise<void> => {
        const tableId = table!.descriptor.id

        const col = column.create()
        // kludge here, turning the column into the type that the backend
        // understands as of now
        const attributes: CustomColumnAttributes = { ...col }
        delete attributes.name
        delete attributes.cellType
        const columnSpec: StandardColumnSpecifier = {
            name: col.name,
            cellType: col.cellType,
            attributes,
        }
        await fetcher({
            url: `/api/table/${tableId}/column`,
            body: { column: columnSpec },
        })
        await mutate()
    }

    // TODO: the cache should be mutated differently
    // TODO: the state should be updated differently
    const renameColumn = async (
        column: Column.Deserialized | Column.Serialized,
        newName: Column["name"]
    ): Promise<void> => {
        const tableId = table!.descriptor.id
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
        column: Column.Deserialized | Column.Serialized,
        update: Partial<Pick<Column.Serialized, SettableColumnProps>>
    ): Promise<void> => {
        const tableId = table!.descriptor.id
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
    const deleteColumn = async (column: Column.Serialized | Column.Deserialized): Promise<void> => {
        const tableId = table!.descriptor.id
        const tableColumn = getTableColumn(column)
        await fetcher({
            url: `/api/table/${tableId}/column/${tableColumn!.id}`,
            body: { tableId: table!.descriptor.id },
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
