import {
    ColumnDescriptor,
    JtDescriptor,
} from "@intutable/join-tables/dist/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { fetchWithUser } from "api"
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
    createColumn: (col: Column.Serialized, joinId?: number) => Promise<void>
    renameColumn: (key: Column["key"], newName: Column["name"]) => Promise<void>
    deleteColumn: (key: Column["key"]) => Promise<void>
    utils: {
        getColumnByKey: (key: Column["key"]) => ColumnDescriptor
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
    table: JtDescriptor
}

export const TableCtxProvider: React.FC<TableCtxProviderProps> = props => {
    const { user } = useUser()

    const { data, error, mutate } = useSWR<TableData>(
        user ? [`/api/table/${props.table.id}`, user, undefined, "GET"] : null,
        fetchWithUser
    )

    /**
     * // TODO:
     *  1. once these api methods return the updated data, inject it into mutate
     *  2. separate rows to a distinct state (required for performance by rdg)
     */

    // #################### utils ####################

    const getColumnByKey = (key: Column["key"]): ColumnDescriptor => {
        const column = data!.metadata.columns.find(c => c.key === key)
        if (!column) throw Error(`could not find column with key ${key}`)
        return column
    }

    const getRowId = (data: TableData | undefined, row: Row) => {
        const uidColumn = data!.metadata.columns.find(
            c => c.name === PM.UID_KEY
        )!
        return row[uidColumn.key] as number
    }

    // #################### row ####################

    const onRowReorder = (fromIndex: number, toIndex: number) => {
        if (data) {
            const newRows = [...data.rows]
            newRows.splice(toIndex, 0, newRows.splice(fromIndex, 1)[0])
            mutate({ ...data, rows: newRows })
            // await XYZ() // update data
            // mutate() // make sure data is updated
        }
    }

    const createRow = async (): Promise<void> => {
        // baseTable, values
        await fetchWithUser(
            "/api/row",
            { baseTable: data?.metadata.baseTable, values: {} },
            "POST"
        )

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

    const deleteRow = async (rowIndex: number, row: Row): Promise<void> => {
        await fetchWithUser(
            "/api/row",
            {
                baseTable: data?.metadata.baseTable,
                condition: [PM.UID_KEY, getRowId(data, row)],
            },
            "DELETE"
        )

        await mutate()
        // todo: filter row and delete by index and then shift them
    }

    const updateRow = async (
        columnKey: string,
        rowId: number,
        value: unknown
    ): Promise<void> => {
        const metaColumn = getColumnByKey(columnKey)
        const baseColumnKey = metaColumn.name

        if (metaColumn.joinId !== null)
            throw Error("attempted to edit data of a different table")

        await fetchWithUser(
            "/api/row",
            {
                baseTable: data?.metadata.baseTable,
                condition: [PM.UID_KEY, rowId],
                update: {
                    [baseColumnKey]: value,
                },
            },
            "PATCH"
        )
        await mutate()
    }

    // #################### column ####################

    const createColumn = async (
        column: Column.Serialized,
        joinId?: number
    ): Promise<void> => {
        await fetchWithUser(
            "/api/column",
            {
                jtId: data?.metadata.descriptor.id,
                joinId,
                column,
            },
            "POST"
        )
        await mutate()
    }

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
        await fetchWithUser(
            `/api/column/${column.id}`,
            { update: updatedColumn },
            "PATCH"
        )
        await mutate()
    }

    const deleteColumn = async (key: Column["key"]): Promise<void> => {
        const column = getColumnByKey(key)
        await fetchWithUser(
            `/api/column/${column.id}`,
            { jtId: data!.metadata.descriptor.id },
            "DELETE"
        )

        await mutate()
    }

    return (
        <TableContext.Provider
            value={{
                project: props.project,
                // states
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
