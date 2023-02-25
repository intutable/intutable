import { IfCtorMap } from "@shared/constraints/ifs/"
import { ConditionIterIter } from "@shared/constraints/util/ConstraintStore"
import type { ConstraintContextProps } from "@shared/constraints/util/ConstraintContextProps"
import { Mismatch } from "@shared/constraints/util/Mismatch"
import { UNSAFE_ViewData } from "@shared/input-masks"
import { useAPI } from "hooks/useAPI"
import { useInputMask } from "hooks/useInputMask"
import { useSnacki } from "hooks/useSnacki"
import { useUserSettings } from "hooks/useUserSettings"
import { useView } from "hooks/useView"
import React, { useEffect, useMemo, useReducer, useRef, useState } from "react"
import { Row } from "types"
import { useRowMask } from "./RowMaskContext"
// import hash from "stable-hash"

// const compare = (a: Row, b: Row) => hash(a) === hash(b)

type ValidationReport = {
    /** Constraints that not passed */
    failed: string[]
    /** All mismatches by constraints that not passed and registered debug mismatches */
    mismatches: (Mismatch & { constraint: string })[]
    succeeded: string[]
    /** If an error occured during validation  */
    interrupted: string[]
    /** Time the validation took in ms */
    time: number
}

type ActionMap = {
    startValidation: { constraints: number }
    addRuntimeError: { error: Error }
    updateProgress: { progress: number }
    endValidation: {
        report: ValidationReport
    }
    reset: null
}

type Action<T extends keyof ActionMap> = {
    type: T
    payload: ActionMap[T]
}

type ValidationState = {
    isRunning: boolean
    finished: boolean
    progress: [number, number]
    runtimeErrors: Error[]
    report: ValidationReport | null
}

const initialValidationState: ValidationState = {
    isRunning: false,
    finished: false,
    progress: [0, 0],
    runtimeErrors: [],
    report: null,
}

const reducer = <T extends keyof ActionMap>(
    state: ValidationState,
    action: Action<T>
): ValidationState => {
    const { type } = action

    switch (type) {
        case "startValidation": {
            const payload = action.payload as ActionMap["startValidation"]
            return {
                isRunning: true,
                finished: false,
                progress: [0, payload.constraints],
                runtimeErrors: [],
                report: null,
            }
        }
        case "addRuntimeError": {
            const payload = action.payload as ActionMap["addRuntimeError"]
            return {
                ...state,
                runtimeErrors: [...state.runtimeErrors, payload.error],
            }
        }
        case "updateProgress": {
            const payload = action.payload as ActionMap["updateProgress"]
            return {
                ...state,
                progress: [payload.progress, state.progress[1]],
            }
        }
        case "endValidation": {
            const payload = action.payload as ActionMap["endValidation"]
            return {
                ...state,
                isRunning: false,
                finished: true,
                report: payload.report,
            }
        }
        case "reset": {
            return initialValidationState
        }
        default:
            return state
    }
}

export type ConstraintValidationContextProps = {
    state: ValidationState
    loading: boolean
    validate: () => void
}
const initialState: ConstraintValidationContextProps = {
    state: initialValidationState,
    loading: true,
    validate: undefined!,
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
    const { rowMaskState, setSuppressRowChange } = useRowMask()

    // state
    const [state, dispatch] = useReducer(reducer, initialValidationState)
    const [loading, setLoading] = useState<boolean>(true)

    const _validate = () => {}

    // disallow changing row when running
    useEffect(() => {
        setSuppressRowChange(state.isRunning)
    }, [setSuppressRowChange, state.isRunning])

    // useEffect(() => {
    //     // if some data in contextProps was changed AND `state.finished === true`
    //     // then reset the statet
    //     dispatch({ type: "reset", payload: null })
    // }, [contextProps])

    const validate = async () => {
        if (state.isRunning) {
            return
        }
        if (
            !userSettings ||
            userSettings.constraintValidation === "never" ||
            currentInputMask === null ||
            rowMaskState.mode === "closed" ||
            !contextProps
        )
            return

        dispatch({
            type: "startValidation",
            payload: {
                constraints: currentInputMask.constraints.length,
            },
        })

        const report: ValidationReport = {
            succeeded: [],
            failed: [],
            interrupted: [],
            mismatches: [],
            time: 0,
        }
        const begin = new Date()

        for await (const [index, constraint] of currentInputMask.constraints.entries()) {
            try {
                const conditions = Array.from(new ConditionIterIter(constraint.conditions))
                const node = conditions[0]

                // BUG: DEV
                if (!node || node.__type === "operator" || conditions.length > 1)
                    throw new Error(
                        "Only one condition supported since operators are not implemented yet."
                    )

                const ctor = IfCtorMap.get(node.__ctor)
                if (!ctor) throw new Error(`No ctor for ${node.__ctor}`)

                const instance = node.__props ? new ctor(...node.__props) : new ctor() // BUG: probably a bug in here, see `Timeout.ts`
                const passed = await instance.validate(contextProps)

                if (passed) {
                    // constraint succeeded, execute 'do's
                    if (constraint.executments.length > 0) {
                        throw new Error("Not Implemented")
                    }
                    report.succeeded = [...report.succeeded, constraint.name]
                } else {
                    // constraint failed (mismatch), show debug instructions to the user
                    if (constraint.debugMessage)
                        report.mismatches = [
                            ...report.mismatches,
                            { ...constraint.debugMessage, constraint: constraint.name },
                        ]

                    report.failed = [...report.failed, constraint.name]
                }
            } catch (error) {
                report.interrupted = [...report.interrupted, constraint.name]
                dispatch({
                    type: "addRuntimeError",
                    payload: {
                        error: error instanceof Error ? error : new Error("Unknown Interruption"),
                    },
                })
            } finally {
                dispatch({
                    type: "updateProgress",
                    payload: { progress: index + 1 },
                })
            }
        }

        // end validation
        dispatch({
            type: "endValidation",
            payload: {
                report: {
                    ...report,
                    time: new Date().getTime() - begin.getTime(),
                },
            },
        })
    }

    useEffect(() => {
        setLoading(true) // TODO: <- is this correct
        if (
            !userSettings ||
            userSettings.constraintValidation === "never" ||
            currentInputMask === null ||
            rowMaskState.mode === "closed" ||
            !contextProps
        )
            return

        setLoading(false) // TODO: where to put this?

        // begin validation
        // call validation
        if (state.finished) {
            dispatch({ type: "reset", payload: null })
        }
        validate()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowMaskState])

    return (
        <ConstraintValidationContext.Provider
            value={{
                state,
                loading,
                validate: _validate,
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
