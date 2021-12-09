import React, { useContext, useEffect, useState } from "react"
import { useRouter } from "next/router"

export type TableContextProps = {}

const initialState: TableContextProps = {}

const TableContext = React.createContext<TableContextProps>(initialState)

export const useTable = () => React.useContext(TableContext)

type TableProviderProps = {
    tableList: string[]
}

export const TableProvider: React.FC<TableProviderProps> = props => {
    const router = useRouter()

    const [currentTable, setCurrentTable] = useState<string | null>(null)
    const [tableData, setTableData] = useState<unknown>(null)

    useEffect(() => {
        if (!currentTable && tableData != null) setTableData(null)

        if (currentTable && tableData == null) {
            ;(async () => {
                // TODO: fetch table data
            })()
        }
    }, [currentTable])

    const reset = () => {
        setCurrentTable(null)
        setTableData(null)
    }

    const changeTable = (table: string) => {
        if (props.tableList.includes(table)) {
            setCurrentTable(table)
        }
    }

    const reloadProject = () => {}
    const reloadTable = () => {}

    return (
        <TableContext.Provider
            value={{
                table: currentTable,
                tableData,
                reset,
            }}
        >
            {props.children}
        </TableContext.Provider>
    )
}
