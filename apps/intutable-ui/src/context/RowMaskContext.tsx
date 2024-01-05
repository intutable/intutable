import { InputMask } from "@shared/input-masks/types"
import { useSnacki } from "hooks/useSnacki"
import { useView } from "hooks/useView"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { Row } from "types"
import { useInputMask } from "hooks/useInputMask"

export type RowMaskContextProps = {
    row: Row | null
    open: (row: { _id: Row["_id"] }) => void
    close: () => void
    inputMask?: InputMask | null
    apply: (mask: { id: InputMask["id"] } | "none") => void
    suppressRowChange: boolean
    setSuppressRowChange: React.Dispatch<React.SetStateAction<boolean>>
}

const initialState: RowMaskContextProps = {
    row: null,
    open: () => {},
    close: () => {},
    inputMask: undefined,
    apply: () => {},
    suppressRowChange: false,
    setSuppressRowChange: () => {},
}

const RowMaskContext = React.createContext<RowMaskContextProps>(initialState)

export const useRowMask = () => React.useContext(RowMaskContext)

type RowMaskProviderProps = {
    row?: { _id: Row["_id"] } | null
    inputMask?: { id: InputMask["id"] } | null
    children: React.ReactNode
}

// BUG: when switching between tables, reset the view, input mask etc.

export const RowMaskProvider: React.FC<RowMaskProviderProps> = props => {
    const { data: view } = useView()
    const { inputMasks } = useInputMask()
    const { snackError } = useSnacki()

    const [row, setRow] = useState<{ _id: Row["_id"] } | null>(props.row ?? null)
    const [inputMask, _setInputMask] = useState<{ id: InputMask["id"] } | null>(
        props.inputMask ?? null
    )
    const [suppressRowChange, setSuppressRowChange] = useState<boolean>(
        initialState.suppressRowChange
    )

    const _setRow: typeof setRow = (...props: Parameters<typeof setRow>) => {
        if (suppressRowChange) {
            snackError(
                "Der Eintrag kann nicht gewechselt oder geschlossen werden, während Constraints validiert werden!"
            )
            return
        }
        setRow(props[0])
    }

    // the whole row based on the id in the state `row`
    const filteredRow = useMemo(() => {
        if (!view || !row) return null
        const filtered = view.rows.find(r => r._id === row._id)
        if (!filtered) {
            // this might occur when the user deletes a row while the row mask is open
            // instead of throwing, just select the nearest row
            // throw new Error("Row Mask: Could not find the selected row in the view: " + row._id)
            const nearestRow = view.rows[0] // since we have no index (only the id), just select the first one
            _setRow({ _id: nearestRow._id })
            return nearestRow
        }
        return filtered
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [row, view])

    // the whole input mask based on the id in the state `inputMask`
    const filteredInputMask = useMemo(() => {
        if (!inputMasks || !inputMask) return undefined
        const filtered = inputMasks.find(mask => mask.id === inputMask.id)
        if (!filtered) {
            _setInputMask(null)
            return null
            // throw new Error("Row Mask: Could not find the specified input mask: " + inputMask.id)
        }
        return filtered
    }, [inputMask, inputMasks])

    return (
        <RowMaskContext.Provider
            value={{
                row: filteredRow,
                open: row => _setRow(row),
                close: () => _setRow(null),
                inputMask: filteredInputMask,
                apply: mask => _setInputMask(mask === "none" ? null : mask),
                suppressRowChange,
                setSuppressRowChange,
            }}
        >
            {props.children}
        </RowMaskContext.Provider>
    )
}

/** Subscribe to events emitted on the row mask context. */
// TODO: implement for Constraints
export const useRowMaskObserver = () => {
    const previousRowState = useRef()
    const previousInputMaskState = useRef()

    const { row, inputMask } = useRowMask()

    useEffect(() => {}, [])

    /**
     * events
     *
     * -- row based --
     * row mask opened
     * row mask closed
     * row inside the row mask changed
     *
     * -- input mask based --
     * input mask applied
     * input mask unmounted
     * input mask changed to different input mask
     */

    return {
        on: {},
    }
}
