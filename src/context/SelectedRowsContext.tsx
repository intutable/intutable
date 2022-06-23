import React, { useEffect, useState } from "react"
import { useAPI } from "./APIContext"

export type SelectedRowsContextProps = {
    selectedRows: ReadonlySet<number>
    setSelectedRows: React.Dispatch<React.SetStateAction<ReadonlySet<number>>>
}

const initialState: SelectedRowsContextProps = {
    selectedRows: new Set(),
    setSelectedRows: undefined!,
}

const SelectedRowsContext =
    React.createContext<SelectedRowsContextProps>(initialState)

export const useSelectedRows = () => React.useContext(SelectedRowsContext)

export const SelectedRowsContextProvider: React.FC<{
    children: React.ReactNode
}> = props => {
    const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
        () => new Set()
    )

    // move in other branch

    const resetSelectedRows = () => setSelectedRows(() => new Set())

    // TODO: test if this works
    const { table } = useAPI()
    useEffect(() => resetSelectedRows(), [table])

    // TODO: issue #100 can be fixed here

    // solution 1
    // observe route changes: when a table is changed, reset the rows
    // but only if the table switches to another, because we want to keep
    // the state otherwise

    // solution 2
    // listen to the APIContext an whenever a table gets changed,
    // reset the state

    return (
        <SelectedRowsContext.Provider
            value={{
                selectedRows,
                setSelectedRows,
            }}
        >
            {props.children}
        </SelectedRowsContext.Provider>
    )
}
