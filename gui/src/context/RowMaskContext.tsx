import React, { useState } from "react"
import { Row } from "types"

export type RowMaskMode = "edit" | "create" | "closed"
export type RowMaskState<MODE extends RowMaskMode> = MODE extends "edit"
    ? {
          mode: "edit"
          /** if not traceable or not specified, it will use no one and display the default row mask  */
          inputMaskId?: string
          row: Row
      }
    : MODE extends "create"
    ? { mode: "create" }
    : { mode: "closed" }

export type RowMaskContextProps = {
    rowMaskState: RowMaskState<RowMaskMode>
    setRowMaskState: React.Dispatch<React.SetStateAction<RowMaskState<RowMaskMode>>>
}

const initialState: RowMaskContextProps = {
    rowMaskState: { mode: "closed" },
    setRowMaskState: undefined!,
}

const RowMaskContext = React.createContext<RowMaskContextProps>(initialState)

export const useRowMask = () => React.useContext(RowMaskContext)

type RowMaskProviderProps = {
    children: React.ReactNode
}

export const RowMaskProvider: React.FC<RowMaskProviderProps> = props => {
    const [rowMaskState, setRowMaskState] = useState<RowMaskState<RowMaskMode>>(initialState.rowMaskState)

    return (
        <RowMaskContext.Provider
            value={{
                rowMaskState,
                setRowMaskState,
            }}
        >
            {props.children}
        </RowMaskContext.Provider>
    )
}
