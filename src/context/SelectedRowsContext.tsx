import React, { useState } from "react"

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
