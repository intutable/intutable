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
    themeMode: "light",
    colorScheme: { ...COLOR_SCHEME },
})
