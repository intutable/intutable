import { InputMask } from "@shared/input-masks/types"
import React, { useEffect, useState } from "react"
import { Row } from "types"

/** If not input mask specified, it will use the row mask */
export const NO_INPUT_MASK_DEFAULT = "--default-rowMask--"

export type RowMaskMode = "edit" | "create" | "closed"
export type RowMaskState<MODE extends RowMaskMode> = MODE extends "edit"
    ? {
          mode: "edit"
          row: Row
      }
    : MODE extends "create"
    ? { mode: "create" }
    : { mode: "closed" }

export type RowMaskContextProps = {
    rowMaskState: RowMaskState<RowMaskMode>
    setRowMaskState: React.Dispatch<React.SetStateAction<RowMaskState<RowMaskMode>>>
    selectedInputMask: InputMask["id"]
    setInputMask: React.Dispatch<React.SetStateAction<InputMask["id"]>>
}

const initialState: RowMaskContextProps = {
    rowMaskState: { mode: "closed" },
    setRowMaskState: undefined!,
    selectedInputMask: NO_INPUT_MASK_DEFAULT,
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
    const [selectedInputMask, setInputMask] = useState<InputMask["id"]>(initialState.selectedInputMask)

    // BUG: reset selectedInputMask to default if table changes

    return (
        <RowMaskContext.Provider
            value={{
                rowMaskState,
                setRowMaskState,
                selectedInputMask,
                setInputMask,
            }}
        >
            {props.children}
        </RowMaskContext.Provider>
    )
}
