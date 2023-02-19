import { OptionsObject, useSnackbar } from "notistack"
import React from "react"

/**
 * Simplifies the {@link useSnackbar} hook.
 */
export const useSnacki = () => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const snackError = (message: React.ReactNode, options?: Omit<OptionsObject, "variant">) =>
        enqueueSnackbar(message, { variant: "error", ...options })

    const snackWarning = (message: React.ReactNode, options?: Omit<OptionsObject, "variant">) =>
        enqueueSnackbar(message, { variant: "warning", ...options })

    const snackSuccess = (message: React.ReactNode, options?: Omit<OptionsObject, "variant">) =>
        enqueueSnackbar(message, { variant: "success", ...options })

    const snackInfo = (message: React.ReactNode, options?: Omit<OptionsObject, "variant">) =>
        enqueueSnackbar(message, { variant: "info", ...options })

    const snack = (message: React.ReactNode, options?: Omit<OptionsObject, "variant">) =>
        enqueueSnackbar(message, { variant: "default", ...options })

    return {
        snackError,
        snackWarning,
        snackSuccess,
        snackInfo,
        snack,
        closeSnackbar,
    }
}
