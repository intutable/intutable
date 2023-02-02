import { Button } from "@mui/material"
import { useCheckRequiredInputs } from "hooks/useCheckRequiredInputs"
import { useConstraintsCache } from "hooks/useConstraintsCache"
import { useInputMask } from "hooks/useInputMask"
import { usePrevious } from "hooks/usePrevious"
import { useSnacki } from "hooks/useSnacki"
import React, { useEffect, useState } from "react"
import { useRowMask } from "./RowMaskContext"

export type ConstraintMismatch = {
    /** needs to be unique */
    key: React.Key
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

    const {
        constraintMismatches,
        addConstraintMismatch,
        removeConstraintMismatch,
        clear: clearConstraintsCache,
    } = useConstraintsCache() // TODO:  find a solution here
    // TODO: when a value via the input mask is updated, detect that and fire a constraint check
    const [isSynchronising, setIsSynchronising] = useState<boolean>(false)
    const [loaded, setLoaded] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)

    const reset = () => {
        clearConstraintsCache()
        setIsSynchronising(false)
        setLoaded(false)
        setError(null)
    }

    const { missingInputs } = useCheckRequiredInputs()
    useEffect(() => {
        if (missingInputs.length > 0) {
            const mismatches = missingInputs.map<ConstraintMismatch>(columnName => ({
                key: `Eingabe fehlt – ${columnName}`,
                title: `Eingabe fehlt`,
                description: `Die Eingabe für das Feld "${columnName}" fehlt.`,
                conflict: [{ field: columnName, value: "" }],
            }))
            addConstraintMismatch(...mismatches)
        }
    }, [addConstraintMismatch, missingInputs])

    // snack errors & mismatches
    // useEffect(() => {
    //     if (error) snackError(`Es ist ein Fehler bei der Validierung aufgetreten: ${error.message}`)
    //     if (constraintMismatches.length > 0)
    //         snackWarning(
    //             `Es ${constraintMismatches.length === 1 ? "ist" : "sind"} ${constraintMismatches.length} ${
    //                 constraintMismatches.length === 1 ? "Diskrepanz" : "Diskrepanzen"
    //             } zwischen der Eingabe und Regeln aufgetreten!`,
    //             {
    //                 persist: true,
    //                 action: key => (
    //                     <Button onClick={() => closeSnackbar(key)} sx={{ color: "white" }}>
    //                         Verstanden
    //                     </Button>
    //                 ),
    //                 preventDuplicate: true,
    //             }
    //         )
    // }, [closeSnackbar, constraintMismatches, error, snackError, snackWarning])

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
            addConstraintMismatch({
                key: "Test",
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
            })
        }

        const timeout_loaded = setTimeout(dummyBehaviour1, 2500)
        const timeout_valid = setTimeout(dummyBehaviour2, 5000)
        // const timeout_invalid = setTimeout(dummyBehaviour3, 10000)

        return () => {
            clearTimeout(timeout_loaded)
            clearTimeout(timeout_valid)
            // clearTimeout(timeout_invalid)
        }
    }, [addConstraintMismatch])

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
