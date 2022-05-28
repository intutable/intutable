import { asTable } from "@intutable/lazy-views/dist/selectable"
import { fetcher } from "api"
import { TableHookOptions, useTable } from "hooks/useTable"
import { useView } from "hooks/useView"
import { Column, Row, TableData } from "types"
import { project_management_constants } from "types/type-annotations/project-management"
import { useColumn } from "./useColumn"

/**
 * @deprecated
 */
export const getRowId = (data: TableData | undefined, row: Row) => {
    const uidColumn = data!.metadata.columns.find(
        c => c.name === project_management_constants.UID_KEY
    )!
    return row[uidColumn.key] as number
}

/**
 * ### useRow hook.
 *
 * Provides methods for manipulating rows of a table.
 *
 * It uses the {@link APIContextProvider}
 * to determine the current selected table.
 *
 * @param {Partial<PublicConfiguration<TableData, any, BareFetcher<TableData>>>} [options.swrOptions] Options for the underlying {@link useSWR} hook.
 *
 * @param {ViewDescriptor} [options.table] If you want to fetch a diffrent table than specified in the api context, you can use this option.
 */
export const useRow = (options?: TableHookOptions) => {
    const { data: table } = useTable(options)
    const { data: view, error, mutate } = useView()
    const { getViewColumn } = useColumn(options)

    /**
     * Used for row reordering / drag n drop
     * // TODO: implement
     */
    const onRowReorder = (fromIndex: number, toIndex: number) => {
        if (table && view) {
            const newRows = [...view.rows]
            newRows.splice(toIndex, 0, newRows.splice(fromIndex, 1)[0])
            mutate({ ...view, rows: newRows })
            // await XYZ() // update data
            // mutate() // make sure data is updated
        }
    }

    // TODO: the cache should be mutated differently
    // TODO: the state should be updated differently
    // TODO: put `asTable` into the corresponding api route
    const createRow = async (): Promise<void> => {
        await fetcher({
            url: "/api/row",
            body: { table: asTable(table!.metadata.source).table, values: {} },
        })

        await mutate()
        // const lastRowIndex = rows.length
        // const deserializedRow = SerializableTable.deserializeRow(
        //     serializedRow,
        //     lastRowIndex
        // )
        // setRows(prev => {
        //     prev.push(deserializedRow)
        //     return prev
        // })
    }

    // TODO: the cache should be mutated differently
    // TODO: the state should be updated differently
    // TODO: filter row and delete by index and then shift them
    // TODO: put `asTable` into the corresponding api route
    // TODO: get rid of getRowId
    const deleteRow = async (row: Row): Promise<void> => {
        await fetcher({
            url: "/api/row",
            body: {
                table: asTable(table!.metadata.source).table,
                condition: [
                    project_management_constants.UID_KEY,
                    getRowId(view, row),
                ], // just use row._id ?
            },
            method: "DELETE",
        })

        await mutate()
    }

    // TODO: the cache should be mutated differently
    // TODO: the state should be updated differently
    // TODO: do not use the col key, use its id
    // TODO: `value` needs a (better) type
    // TODO: put `asTable` into the corresponding api route
    const updateRow = async (
        column: Column,
        rowId: Row["_id"],
        value: unknown
    ): Promise<void> => {
        // it's a view on top of a view, but the property `column.name`
        // reflects the actual name in the DB regardless of nesting.
        const metaColumn = getViewColumn(column)
        const baseColumnKey = metaColumn.name

        // TODO: put this in the api route
        if (metaColumn.joinId !== null)
            throw Error("attempted to edit data of a different table")

        await fetcher({
            url: "/api/row",
            body: {
                table: asTable(table!.metadata.source).table,
                condition: [project_management_constants.UID_KEY, rowId],
                update: {
                    [baseColumnKey]: value,
                },
            },
            method: "PATCH",
        })
        await mutate()
    }

    return {
        mutate,
        onRowReorder,
        createRow,
        deleteRow,
        updateRow,
    }
}
