import { InputMask } from "@shared/input-masks/types"
import { useSnacki } from "hooks/useSnacki"
import { useView } from "hooks/useView"
import React, { useState } from "react"

export type RowMaskMode = "edit" | "closed"
export type RowMaskState<MODE extends RowMaskMode> = MODE extends "edit"
    ? {
          mode: "edit"
          row: { _id: number }
      }
    : { mode: "closed" }

export type RowMaskContextProps = {
    rowMaskState: RowMaskState<RowMaskMode>
    setRowMaskState: React.Dispatch<React.SetStateAction<RowMaskState<RowMaskMode>>>
    appliedInputMask: InputMask["id"] | null
    setInputMask: React.Dispatch<React.SetStateAction<InputMask["id"] | null>>
    setSuppressRowChange: React.Dispatch<React.SetStateAction<boolean>>
}

const initialState: RowMaskContextProps = {
    rowMaskState: { mode: "closed" },
    setRowMaskState: undefined!,
    appliedInputMask: null,
    setInputMask: undefined!,
    setSuppressRowChange: undefined!,
}

const RowMaskContext = React.createContext<RowMaskContextProps>(initialState)

export const useRowMask = () => React.useContext(RowMaskContext)

type RowMaskProviderProps = {
    initialRowMaskState?: RowMaskState<RowMaskMode>
    initialAppliedInputMask?: InputMask["id"]
    children: React.ReactNode
}

export const RowMaskProvider: React.FC<RowMaskProviderProps> = props => {
    const { data: view } = useView()
    const { snackError } = useSnacki()

    const [suppressRowChange, setSuppressRowChange] = useState<boolean>(false)

    const [rowMaskState, setRowMaskState] = useState<RowMaskState<RowMaskMode>>(
        props.initialRowMaskState ?? initialState.rowMaskState
    )

    /** if not traceable or not specified, it will use no one and display the default row mask  */
    const [appliedInputMask, setInputMask] = useState<InputMask["id"] | null>(
        props.initialAppliedInputMask ?? null
    )

    // BUG: reset selectedInputMask to default if table changes
    // TODO: add an elaborated mechanism that selects the inputMask automatically, if not specified

    const _setRowMaskState: typeof setRowMaskState = (
        ...props: Parameters<typeof setRowMaskState>
    ) => {
        if (suppressRowChange) {
            snackError(
                "Der Eintrag kann nicht gewechselt oder geschlossen werden, während Constraints validiert werden!"
            )
            return
        }
        setRowMaskState(props[0])
    }

    return (
        <RowMaskContext.Provider
            value={{
                rowMaskState,
                setRowMaskState: _setRowMaskState,
                appliedInputMask,
                setInputMask,
                setSuppressRowChange,
            }}
        >
            {props.children}
        </RowMaskContext.Provider>
    )
}
