import { AlertType as Alert } from "@shared/constraints/dos/Alert"
import { IfCtorMap } from "@shared/constraints/ifs/"
import { ConditionIterIter } from "@shared/constraints/util/ConstrainStore"
import type { ConstraintContextProps } from "@shared/constraints/util/ConstraintContextProps"
import { Mismatch } from "@shared/constraints/util/Mismatch"
import { UNSAFE_ViewData } from "@shared/input-masks"
import { useAPI } from "hooks/useAPI"
import { useInputMask } from "hooks/useInputMask"
import { useSnacki } from "hooks/useSnacki"
import { useUserSettings } from "hooks/useUserSettings"
import { useView } from "hooks/useView"
import React, { useEffect, useMemo, useState } from "react"
import { useRowMask } from "./RowMaskContext"

export type ConstraintValidationContextProps = {
    succeeded: boolean | null
    isValidationRunning: boolean
    steps: [number, number]
    runtimeError: Error | null
    debugMessages: Mismatch[]
    loading: boolean
}
const initialState: ConstraintValidationContextProps = {
    succeeded: null,
    isValidationRunning: false,
    steps: [0, 0],
    runtimeError: null,
    debugMessages: [],
    loading: true,
}
const ConstraintValidationContext =
    React.createContext<ConstraintValidationContextProps>(initialState)
export const useConstraintValidation = () => React.useContext(ConstraintValidationContext)
type ConstraintValidationProviderProps = {
    children: React.ReactNode
}

export const ConstraintValidationProvider: React.FC<ConstraintValidationProviderProps> = props => {
    const { snackError, snackWarning, closeSnackbar } = useSnacki()
    const { userSettings } = useUserSettings()
    const { currentInputMask } = useInputMask()
    const { props: contextProps } = useConstraintContextProps()

    // state

    const [succeeded, setSucceeded] = useState<boolean | null>(null)
    const [isValidationRunning, setIsValidationRunning] = useState<boolean>(false)
    const [steps, setSteps] = useState<[number, number]>([0, 0])
    const [runtimeError, setRuntimeError] = useState<Error | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const [debugMessages, setDebugMessages] = useState<Mismatch[]>([])

    // BUG: somewhere is a loop

    useEffect(() => {
        // reset state
        // setSucceeded(null)
        // setIsValidationRunning(false)
        // setSteps([0, 0])
        // setRuntimeError(null)
        // setDebugMessages([])
        // setLoading(true)

        if (!userSettings || !currentInputMask || !contextProps) return
        if (userSettings.enableConstrainValidation === false) return

        // begin validation

        setLoading(false)
        setIsValidationRunning(true)
        setSteps([0, currentInputMask.constraints.length])

        currentInputMask.constraints.forEach((constraint, index) => {
            const conditions = Array.from(new ConditionIterIter(constraint.conditions))
            const node = conditions[0]
            if (!node || node.__type === "operator" || conditions.length > 1)
                throw new Error(
                    "Only one condition supported since operators are not implemented yet."
                )

            const ctor = IfCtorMap.get(node.__ctor)
            if (!ctor) throw new Error(`No ctor for ${node.__ctor}`)
            const instance = new ctor(node.__props) // TODO: inject args correctly

            const result = instance.validate(contextProps)

            if (result === false) {
                // constraint failed (mismatch), show debug instructions to the user
                if (constraint.debugMessage)
                    setDebugMessages(prev => [...prev, constraint.debugMessage])

                setSucceeded(false)
            } else {
                // constraint succeeded, execute 'do's
                throw new Error("Not Implemented")
            }

            setSteps(prev => [index + 1, prev[1]])
        })

        // end validation
        // if (succeeded === null) setSucceeded(true) // this the loop?
        setIsValidationRunning(false)

        return () => {}
    }, [contextProps, currentInputMask, userSettings])

    return (
        <ConstraintValidationContext.Provider
            value={{
                succeeded,
                isValidationRunning,
                steps,
                runtimeError,
                debugMessages,
                loading,
            }}
        >
            {props.children}
        </ConstraintValidationContext.Provider>
    )
}

export const useConstraintContextProps = () => {
    const { project, table, view } = useAPI()
    const { data } = useView()
    const { userSettings } = useUserSettings()
    const { rowMaskState } = useRowMask()
    const { currentInputMask } = useInputMask()

    const props: ConstraintContextProps | null = useMemo(() => {
        if (
            !project ||
            !table ||
            !view ||
            !data ||
            !userSettings ||
            !currentInputMask ||
            rowMaskState.mode === "closed"
        )
            return null

        const { inputMasks, ...viewData } = data as unknown as UNSAFE_ViewData
        const { constraints, ...inputMask } = currentInputMask
        const row = data.rows.find(r => r._id === rowMaskState.row._id)
        if (!row) throw new Error("Row not found")

        return {
            project,
            table,
            view,
            inputMask,
            data: viewData,
            currentRecord: row,
        }
    }, [currentInputMask, data, project, rowMaskState, table, userSettings, view])

    return {
        props,
    }
}

class MyClass {
    methodA(): this {
        return this
    }
    methodB(): Omit<this, "methodA"> {
        return this
    }
}
