import type { PaletteMode, Theme } from "@mui/material"

import createTheme from "./utils"

/**
 * `COLOR_SCHEME` is added to the theme via module augmentation in `./utils.ts`.
 * You can access added colors by `theme.colorScheme[STRING]`.
 */
export const COLOR_SCHEME = {}

/**
 * Light Theme for the App
 */
export const lightTheme = createTheme({
    colorScheme: { ...COLOR_SCHEME },
})

/**
 * Dark Theme for the App
 */
export const darkTheme = createTheme({
    colorScheme: { ...COLOR_SCHEME },
    palette: {
        primary: {
            main: "#333",
        },
        secondary: {
            main: "#fff",
        },
        background: {
            default: "#333",
        },
    },
})

export const getDesignToken = (mode: PaletteMode) => (mode === "light" ? lightTheme : darkTheme)
