import { ColumnInfo } from "@intutable/lazy-views"
import { fetcher } from "api"
import { Parser } from "api/utils"
import { useTable } from "hooks/useTable"
import { Column } from "types"

/**
 * Get the Column Info {@type {ColumnInfo}} for a specific column
 * @param {Column} forColumn
 * @returns {ColumnInfo}
 */
const getColumnInfo = (
    columns: ColumnInfo[],
    forColumn: Column
): ColumnInfo => {
    const columnInfo = columns.find(c => c.key === forColumn.key)
    if (!columnInfo)
        throw Error(`Could not find Column Info for column: ${forColumn}`)
    return columnInfo
}

export const useColumn = () => {
    const { data: table, error, mutate } = useTable()

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
    // TODO: get rid of `getColumnByKey`
    const renameColumn = async (
        column: Column,
        newName: Column["name"]
    ): Promise<void> => {
        if (
            table?.columns.some(c => c.key !== column.key && c.name === newName)
        )
            return Promise.reject("alreadyTaken") // instanceof IsTakenError

        const updatedColumn = {
            ...Parser.Column.parse(
                getColumnInfo(table!.metadata.columns, column)
            ),
            name: newName,
        }
        await fetcher({
            url: `/api/column/${column._id!}`,
            body: { update: updatedColumn },
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
        getColumnInfo: getColumnInfo.bind(null, table!.metadata.columns),
    }
}
