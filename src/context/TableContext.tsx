import { ColumnInfo, ViewDescriptor } from "@intutable/lazy-views/dist/types"
import { asTable } from "@intutable/lazy-views/dist/selectable"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { fetcher } from "api"
import { Parser } from "api/utils"
import { useUser } from "auth"
import React from "react"
import useSWR, { KeyedMutator } from "swr"
import { Column, PM, Row, TableData } from "types"

export type TableContextProps = {
    project: ProjectDescriptor
    data: TableData | undefined
    error: Error | null
    onRowReorder: (sourceIndex: number, targetIndex: number) => void
    createRow: () => Promise<void>
    deleteRow: (rowIndex: number, row: Row) => Promise<void>
    updateRow: (
        columnKey: string,
        rowId: number,
        value: unknown
    ) => Promise<void>
    createColumn: (col: Column.Serialized) => Promise<void>
    renameColumn: (key: Column["key"], newName: Column["name"]) => Promise<void>
    deleteColumn: (key: Column["key"]) => Promise<void>
    // TODO: put the utils in a subcontext
    utils: {
        getColumnByKey: (key: Column["key"]) => ColumnInfo
        getRowId: (data: TableData | undefined, row: Row) => number
        mutate: KeyedMutator<TableData>
    }
}

const initialState: TableContextProps = {
    project: undefined!,
    data: undefined!,
    error: undefined!,
    onRowReorder: undefined!,
    createRow: undefined!,
    deleteRow: undefined!,
    updateRow: undefined!,
    createColumn: undefined!,
    renameColumn: undefined!,
    deleteColumn: undefined!,
    utils: undefined!,
}

const TableContext = React.createContext<TableContextProps>(initialState)

export const useTableCtx = () => React.useContext(TableContext)

export type TableCtxProviderProps = {
    project: ProjectDescriptor
    table: ViewDescriptor
    children?: React.ReactNode
}

export const TableCtxProvider: React.FC<TableCtxProviderProps> = props => {
    const { user } = useUser()

    const { data, error, mutate } = useSWR<TableData>(
        user ? { url: `/api/table/${props.table.id}`, method: "GET" } : null
    )

    // #################### utils ####################

    // TODO: `Column` was recently augmented, this should not be necessary any more
    const getColumnByKey = (key: Column["key"]): ColumnInfo => {
        const column = data!.metadata.columns.find(c => c.key === key)
        if (!column) throw Error(`could not find column with key ${key}`)
        return column
    }

    // TODO: independent from ctx, should be thrown out as its own utility
    const getRowId = (data: TableData | undefined, row: Row) => {
        const uidColumn = data!.metadata.columns.find(
            c => c.name === PM.UID_KEY
        )!
        return row[uidColumn.key] as number
    }

    // #################### row ####################

    // TODO: ???
    const onRowReorder = (fromIndex: number, toIndex: number) => {
        if (data) {
            const newRows = [...data.rows]
            newRows.splice(toIndex, 0, newRows.splice(fromIndex, 1)[0])
            mutate({ ...data, rows: newRows })
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
            body: { table: asTable(data!.metadata.source).table, values: {} },
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
    const deleteRow = async (rowIndex: number, row: Row): Promise<void> => {
        await fetcher({
            url: "/api/row",
            body: {
                table: asTable(data!.metadata.source).table,
                condition: [PM.UID_KEY, getRowId(data, row)],
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
        columnKey: string,
        rowId: number,
        value: unknown
    ): Promise<void> => {
        const metaColumn = getColumnByKey(columnKey)
        const baseColumnKey = metaColumn.name

        if (metaColumn.joinId !== null)
            throw Error("attempted to edit data of a different table")

        await fetcher({
            url: "/api/row",
            body: {
                table: asTable(data!.metadata.source).table,
                condition: [PM.UID_KEY, rowId],
                update: {
                    [baseColumnKey]: value,
                },
            },
            method: "PATCH",
        })
        await mutate()
    }

    // #################### column ####################

    // TODO: the cache should be mutated differently
    // TODO: the state should be updated differently
    const createColumn = async (column: Column.Serialized): Promise<void> => {
        await fetcher({
            url: "/api/column",
            body: {
                viewId: data?.metadata.descriptor.id,
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
        key: Column["key"],
        newName: Column["name"]
    ): Promise<void> => {
        if (data!.columns.some(c => c.key !== key && c.name === newName))
            return Promise.reject("alreadyTaken")

        const column = getColumnByKey(key)
        const updatedColumn = {
            ...Parser.Column.parse(column),
            name: newName,
        }
        await fetcher({
            url: `/api/column/${column.id}`,
            body: { update: updatedColumn },
            method: "PATCH",
        })
        await mutate()
    }

    // TODO: the cache should be mutated differently
    // TODO: the state should be updated differently
    // TODO: get rid of `getColumnByKey`
    const deleteColumn = async (key: Column["key"]): Promise<void> => {
        const column = getColumnByKey(key)
        await fetcher({
            url: `/api/column/${column.id}`,
            body: { viewId: data!.metadata.descriptor.id },
            method: "DELETE",
        })

        await mutate()
    }

    return (
        <TableContext.Provider
            value={{
                // states
                project: props.project,
                data,
                error,
                // row
                onRowReorder,
                createRow,
                deleteRow,
                updateRow,
                // column dispatchers
                createColumn,
                renameColumn,
                deleteColumn,
                // utils
                utils: {
                    getColumnByKey,
                    getRowId,
                    mutate,
                },
            }}
        >
            {props.children}
        </TableContext.Provider>
    )
}
