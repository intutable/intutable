import { asTable } from "@intutable/lazy-views/dist/selectable"
import { fetcher } from "api"
import { useTable } from "hooks/useTable"
import { Column, PM, Row, TableData } from "types"
import { getColumnInfo } from "./useColumn"

/**
 * @deprecated
 */
export const getRowId = (data: TableData | undefined, row: Row) => {
    const uidColumn = data!.metadata.columns.find(c => c.name === PM.UID_KEY)!
    return row[uidColumn.key] as number
}

/**
 * ### useRow hook.
 *
 * Provides methods for manipulating rows of a table.
 *
 * It uses the {@link APIContextProvider}
 * to determine the current selected table.
 */
export const useRow = () => {
    const { data: table, error, mutate } = useTable()

    /**
     * Used for row reordering / drag n drop
     * // TODO: implement
     */
    const onRowReorder = (fromIndex: number, toIndex: number) => {
        if (table) {
            const newRows = [...table.rows]
            newRows.splice(toIndex, 0, newRows.splice(fromIndex, 1)[0])
            mutate({ ...table, rows: newRows })
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
                condition: [PM.UID_KEY, getRowId(table, row)], // just use row._id ?
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
        const metaColumn = getColumnInfo(table!.metadata.columns, column)
        const baseColumnKey = metaColumn.name

        // TODO: put this in the api route
        if (metaColumn.joinId !== null)
            throw Error("attempted to edit data of a different table")

        await fetcher({
            url: "/api/row",
            body: {
                table: asTable(table!.metadata.source).table,
                condition: [PM.UID_KEY, rowId],
                update: {
                    [baseColumnKey]: value,
                },
            },
            method: "PATCH",
        })
        await mutate()
    }

    return {
        error,
        mutate,
        onRowReorder,
        createRow,
        deleteRow,
        updateRow,
    }
}
