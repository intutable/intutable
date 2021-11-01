import { createTheme, PaletteMode } from "@mui/material"
import { COLOR_SCHEME } from "./theme"


interface _Theme {
    themeMode: PaletteMode
    colorScheme: typeof COLOR_SCHEME
}

interface _ThemeOptions {
    themeMode: PaletteMode
    colorScheme?: typeof COLOR_SCHEME
}

declare module "@mui/material/styles" {
    export interface Theme extends _Theme { }
    export interface ThemeOptions extends _ThemeOptions { }
}

export namespace MUIThemeCustomTypes {
    export interface Theme extends _Theme { }
    export interface ThemeOptions extends _ThemeOptions { }
}

export default createTheme
