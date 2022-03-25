import React, { useEffect } from "react"
import useSWR from "swr"
import { RowsChangeData } from "react-data-grid"

import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import {
    JtDescriptor,
    ColumnDescriptor,
} from "@intutable/join-tables/dist/types"
import { fetchWithUser } from "api"
import { useAuth } from "context"
import { PM, Row, Column, TableData } from "types"
import { Parser } from "api/utils"

export type TableContextProps = {
    data: TableData | undefined
    error: Error | null
    onRowReorder: (sourceIndex: number, targetIndex: number) => void
    createRow: () => Promise<void>
    deleteRow: (rowIndex: number, row: Row) => Promise<void>
    partialRowUpdate: (rows: Row[], data: RowsChangeData<Row>) => Promise<void>
    createColumn: (col: Column.Serialized) => Promise<void>
    renameColumn: (key: Column["key"], newName: Column["name"]) => Promise<void>
    deleteColumn: (key: Column["key"]) => Promise<void>
}

const initialState: TableContextProps = {
    data: undefined!,
    error: undefined!,
    onRowReorder: undefined!,
    createRow: undefined!,
    deleteRow: undefined!,
    partialRowUpdate: undefined!,
    createColumn: undefined!,
    renameColumn: undefined!,
    deleteColumn: undefined!,
}

const TableContext = React.createContext<TableContextProps>(initialState)

export const useTableCtx = () => React.useContext(TableContext)

export type TableCtxProviderProps = {
    project: ProjectDescriptor
    table: JtDescriptor
}

export const TableCtxProvider: React.FC<TableCtxProviderProps> = props => {
    const { user } = useAuth()

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
    function getColumnByKey(key: Column["key"]): ColumnDescriptor {
        const column = data!.metadata.columns.find(c => c.key === key)
        if (!column) throw Error(`could not find column with key ${key}`)
        else {
            return column
        }
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
            user!,
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
            user!,
            {
                baseTable: data?.metadata.baseTable,
                condition: { [PM.UID_KEY]: row[PM.UID_KEY] },
            },
            "DELETE"
        )

        await mutate()
        // todo: filter row and delete by index and then shift them
    }

    const partialRowUpdate = async (
        rows: Row[],
        changeData: RowsChangeData<Row>
    ): Promise<void> => {
        const changedRow = rows[changeData.indexes[0]]

        const joinColumnKey = changeData.column.key
        const joinTableColumn = getColumnByKey(joinColumnKey)

        if (joinTableColumn.joinId !== null)
            throw Error("attempted to edit data of a different table")
        const baseColumnKey = joinTableColumn.name
        await fetchWithUser(
            "/api/row",
            user!,
            {
                baseTable: data?.metadata.baseTable,
                condition: [PM.UID_KEY, changedRow[PM.UID_KEY]],
                update: {
                    [baseColumnKey]: changedRow[joinColumnKey],
                },
            },
            "PATCH"
        )
        await mutate()
        // setRows(rows)
    }

    // #################### column ####################

    const createColumn = async (column: Column.Serialized): Promise<void> => {
        await fetchWithUser(
            "/api/column",
            user!,
            {
                joinTable: data?.metadata.descriptor,
                baseTable: data?.metadata.baseTable,
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
        const column = getColumnByKey(key)
        const updatedColumn = {
            ...Parser.Column.parse(column),
            name: newName,
        }
        await fetchWithUser(
            `/api/column/${column.id}`,
            user!,
            { update: updatedColumn },
            "PATCH"
        )
        await mutate()
    }

    const deleteColumn = async (key: Column["key"]): Promise<void> => {
        const column = getColumnByKey(key)
        await fetchWithUser(
            `/api/column/${column.id}`,
            user!,
            undefined,
            "DELETE"
        )

        await mutate()
    }

    return (
        <TableContext.Provider
            value={{
                // states
                data,
                error,
                // row
                onRowReorder,
                createRow,
                deleteRow,
                partialRowUpdate,
                // column dispatchers
                createColumn,
                renameColumn,
                deleteColumn,
            }}
        >
            {props.children}
        </TableContext.Provider>
    )
}
