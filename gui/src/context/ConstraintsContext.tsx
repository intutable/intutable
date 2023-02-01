import { Button } from "@mui/material"
import { useInputMask } from "hooks/useInputMask"
import { usePrevious } from "hooks/usePrevious"
import { useSnacki } from "hooks/useSnacki"
import React, { useEffect, useState } from "react"
import { useRowMask } from "./RowMaskContext"

export type ConstraintMismatch = {
    title: string
    description: string
    conflict: { field: string; value: string }[]
}

export type ConstraintsContextProps = {
    isValid: boolean
    constraintMismatches: ConstraintMismatch[]
    isSynchronising: boolean
    loaded: boolean
    error: Error | null
}

const initialState: ConstraintsContextProps = {
    isValid: undefined!,
    constraintMismatches: [],
    isSynchronising: undefined!,
    loaded: false,
    error: null,
}

const ConstraintsContext = React.createContext<ConstraintsContextProps>(initialState)

export const useConstraints = () => React.useContext(ConstraintsContext)

type ConstraintsProviderProps = {
    children: React.ReactNode
}

export const ConstraintsProvider: React.FC<ConstraintsProviderProps> = props => {
    const { snackError, snackWarning, closeSnackbar } = useSnacki()

    const { rowMaskState } = useRowMask()
    const { currentInputMask } = useInputMask()

    const [constraintMismatches, setConstraintMismatches] = useState<ConstraintMismatch[]>([])
    const [isSynchronising, setIsSynchronising] = useState<boolean>(false)
    const [loaded, setLoaded] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)

    const reset = () => {
        setConstraintMismatches([])
        setIsSynchronising(false)
        setLoaded(false)
        setError(null)
    }

    // snack errors & mismatches
    useEffect(() => {
        if (error) snackError(`Es ist ein Fehler bei der Validierung aufgetreten: ${error.message}`)
        if (constraintMismatches.length > 0)
            snackWarning(
                `Es ${constraintMismatches.length === 1 ? "ist" : "sind"} ${constraintMismatches.length} ${
                    constraintMismatches.length === 1 ? "Diskrepanz" : "Diskrepanzen"
                } zwischen der Eingabe und Regeln aufgetreten!`,
                {
                    persist: true,
                    action: key => (
                        <Button onClick={() => closeSnackbar(key)} sx={{ color: "white" }}>
                            Verstanden
                        </Button>
                    ),
                    preventDuplicate: true,
                }
            )
    }, [closeSnackbar, constraintMismatches, error, snackError, snackWarning])

    /** dummy behaviour */
    useEffect(() => {
        const dummyBehaviour1 = () => {
            console.log("dummy behaviour 1")
            setLoaded(true)
            setIsSynchronising(true)
        }
        const dummyBehaviour2 = () => {
            console.log("dummy behaviour 2")
            setIsSynchronising(false)
        }
        const dummyBehaviour3 = () => {
            console.log("dummy behaviour 3")
            setConstraintMismatches(prev => [
                ...prev,
                {
                    title: "Test",
                    description:
                        "Im Normalfall würde hier stehen, was du falsch gemacht hast sowie eine Beschreibung, wie der Konflikt aufzulösen ist.",
                    conflict: [
                        {
                            field: "Akad. Titel",
                            value: "M.Sc.",
                        },
                        { field: "Rolle", value: "Lehrstuhlinhaber" },
                    ],
                },
            ])
        }

        const timeout_loaded = setTimeout(dummyBehaviour1, 2500)
        const timeout_valid = setTimeout(dummyBehaviour2, 5000)
        // const timeout_invalid = setTimeout(dummyBehaviour3, 10000)

        return () => {
            clearTimeout(timeout_loaded)
            clearTimeout(timeout_valid)
            // clearTimeout(timeout_invalid)
        }
    }, [])

    return (
        <ConstraintsContext.Provider
            value={{
                isValid: constraintMismatches.length === 0,
                constraintMismatches,
                isSynchronising,
                loaded,
                error,
            }}
        >
            {props.children}
        </ConstraintsContext.Provider>
    )
}
