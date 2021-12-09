import React, { useContext, useEffect, useState } from "react"
import { useRouter } from "next/router"

export type TableContextProps = {}

const initialState: TableContextProps = {}

const TableContext = React.createContext<TableContextProps>(initialState)

export const useTable = () => React.useContext(TableContext)

export const TableProvider: React.FC = props => {
    const router = useRouter()

    useEffect(() => {}, [])

    return (
        <TableContext.Provider value={{}}>
            {props.children}
        </TableContext.Provider>
    )
}
