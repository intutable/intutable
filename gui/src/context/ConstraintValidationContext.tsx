import { ViewData } from "@intutable/lazy-views"
import { DoCtorMap } from "@shared/constraints/dos"
import { LogItem } from "@shared/constraints/dos/Log"
import { IfCtorMap } from "@shared/constraints/ifs/"
import type { AppContext } from "@shared/constraints/util/AppContext"
import { ConditionIterIter } from "@shared/constraints/util/ConstraintStore"
import { DoObjectNotation } from "@shared/constraints/util/ObjectNotation"
import { UNSAFE_ViewData } from "@shared/input-masks"
import { InputMask } from "@shared/input-masks/types"
import { useAPI } from "hooks/useAPI"
import { useInputMask } from "hooks/useInputMask"
import { useSnacki } from "hooks/useSnacki"
import { useUserSettings } from "hooks/useUserSettings"
import { useView } from "hooks/useView"
import React, { useEffect, useMemo, useReducer, useState } from "react"
import { useRowMask } from "./RowMaskContext"
// import hash from "stable-hash"

// const compare = (a: Row, b: Row) => hash(a) === hash(b)

type ValidationReport = {
    /** Constraints that not passed */
    failed: string[]
    /** All mismatches by constraints that not passed and registered debug mismatches */
    log: LogItem[]
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
    const { snackError, snackWarning, closeSnackbar, snackInfo } = useSnacki()
    const { userSettings } = useUserSettings()
    const { props: contextProps } = useAppContextState()
    const { setSuppressRowChange, row, inputMask } = useRowMask()

    // state
    const [state, dispatch] = useReducer(reducer, initialValidationState)
    const [loading, setLoading] = useState<boolean>(
        userSettings ? (userSettings?.constraintValidation !== "never" ? true : false) : true
    )

    const [test, setTest] = useState(false)

    // disallow changing row when running
    useEffect(() => {
        setSuppressRowChange(state.isRunning)
    }, [setSuppressRowChange, state.isRunning])

    // main effect that automatically triggers validation cycles
    useEffect(() => {
        if (
            !userSettings ||
            userSettings.constraintValidation === "never" ||
            !inputMask ||
            !row ||
            !contextProps
        )
            return
        else {
            setLoading(false)
        }

        if (state.finished) {
            dispatch({ type: "reset", payload: null })
        }

        runValidationCycle()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [row]) // TODO finally refactor rowMaskState and add listeners

    const runValidationCycle = async () => {
        if (state.isRunning) {
            return
        }
        if (
            !userSettings ||
            userSettings.constraintValidation === "never" ||
            !inputMask ||
            !row ||
            !contextProps
        )
            return

        dispatch({
            type: "startValidation",
            payload: {
                constraints: inputMask.constraints.length,
            },
        })

        const report: ValidationReport = {
            succeeded: [],
            failed: [],
            interrupted: [],
            log: [],
            time: 0,
        }
        const begin = new Date()

        for await (const [index, constraint] of inputMask.constraints.entries()) {
            try {
                const conditions = Array.from(new ConditionIterIter(constraint.conditions))
                const node = conditions[0]

                // BUG: DEV
                if (!node || node.__type === "operator" || conditions.length > 1)
                    throw new Error(
                        "Only one condition supported since operators are not implemented yet."
                    )

                const ifCtor = IfCtorMap.get(node.__ctor)
                if (!ifCtor) throw new Error(`No ctor for ${node.__ctor}`)

                const instance = node.__props
                    ? new ifCtor(...Object.values(node.__props))
                    : new ifCtor() // BUG: probably a bug in here, see `Timeout.ts`
                const passed = await instance.validate(contextProps)

                if (passed) {
                    // constraint succeeded, execute 'do's
                    if (constraint.executments.length > 0) {
                        const dos = constraint.executments as DoObjectNotation[]
                        dos.forEach(exec => {
                            const doCtor = DoCtorMap.get(exec.__ctor)
                            if (!doCtor) throw new Error(`No ctor for ${node.__ctor}`)
                            const instance = exec.__props
                                ? new doCtor(...Object.values(exec.__props))
                                : new doCtor() // TODO: inject props
                            instance.execute({
                                setTest,
                                snackInfo(message: string) {
                                    snackInfo(message)
                                },
                                log(log: LogItem) {
                                    report.log = [...report.log, log]
                                },
                            })
                        })
                        // throw new Error("Not Implemented")
                    }
                    report.succeeded = [...report.succeeded, constraint.name]
                } else {
                    // constraint failed (mismatch), show debug instructions to the user
                    /** @deprecated */
                    if (constraint.debugMessage)
                        report.log = [
                            ...report.log,
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

    return (
        <ConstraintValidationContext.Provider
            value={{
                state,
                loading,
                validate: runValidationCycle,
            }}
        >
            {props.children}
        </ConstraintValidationContext.Provider>
    )
}

export const useAppContextState = () => {
    const { project, table } = useAPI()
    const { data } = useView()
    const { userSettings } = useUserSettings()
    const { row } = useRowMask()
    const { currentInputMask } = useInputMask()

    const props: AppContext.State | null = useMemo(() => {
        if (!project || !table || !data || !userSettings || !currentInputMask || !row) return null

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { inputMasks, ...viewData } = data as unknown as UNSAFE_ViewData
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { constraints, ...inputMask } = currentInputMask
        if (!row) throw new Error("Row mask not open")

        return {
            project,
            table,
            view: data as unknown as ViewData,
            inputMask: inputMask as InputMask,
            record: row,
        }
    }, [currentInputMask, data, project, row, table, userSettings])

    return {
        props,
    }
}
