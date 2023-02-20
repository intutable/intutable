import type { PaletteMode } from "@mui/material"
import { createTheme } from "@mui/material/styles"

export const COLOR_SCHEME = {
    ochsenblut: "#c61826",
} as const

/**
 * Light Theme for the App
 */
export const lightTheme = createTheme({
    palette: {
        mode: "light",
    },
})

/**
 * Dark Theme for the App
 */
export const darkTheme = createTheme({
    palette: {
        mode: "dark",
    },
})

export const getTheme = (mode: PaletteMode) => (mode === "light" ? lightTheme : darkTheme)
