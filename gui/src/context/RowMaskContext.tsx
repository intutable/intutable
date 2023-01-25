import { InputMask } from "@shared/input-masks/types"
import React, { useEffect, useState } from "react"
import { Row } from "types"

export type RowMaskMode = "edit" | "closed"
export type RowMaskState<MODE extends RowMaskMode> = MODE extends "edit"
    ? {
          mode: "edit"
          row: Row
      }
    : { mode: "closed" }

export type RowMaskContextProps = {
    rowMaskState: RowMaskState<RowMaskMode>
    setRowMaskState: React.Dispatch<React.SetStateAction<RowMaskState<RowMaskMode>>>
    appliedInputMask: InputMask["id"] | null
    setInputMask: React.Dispatch<React.SetStateAction<InputMask["id"] | null>>
}

const initialState: RowMaskContextProps = {
    rowMaskState: { mode: "closed" },
    setRowMaskState: undefined!,
    appliedInputMask: null,
    setInputMask: undefined!,
}

const RowMaskContext = React.createContext<RowMaskContextProps>(initialState)

export const useRowMask = () => React.useContext(RowMaskContext)

type RowMaskProviderProps = {
    children: React.ReactNode
}

export const RowMaskProvider: React.FC<RowMaskProviderProps> = props => {
    const [rowMaskState, setRowMaskState] = useState<RowMaskState<RowMaskMode>>(initialState.rowMaskState)

    /** if not traceable or not specified, it will use no one and display the default row mask  */
    const [appliedInputMask, setInputMask] = useState<InputMask["id"] | null>(null)

    // BUG: reset selectedInputMask to default if table changes

    return (
        <RowMaskContext.Provider
            value={{
                rowMaskState,
                setRowMaskState,
                appliedInputMask,
                setInputMask,
            }}
        >
            {props.children}
        </RowMaskContext.Provider>
    )
}
