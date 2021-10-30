/**
 * @author Heidelberg University
 * @version 0.1.0
 * @file utils.ts
 * @description Utils for the theme
 * @since 29.09.2021
 * @license
 * @copyright © 2021 Heidelberg University
 */

// Node Modules

// Utils / Types / Api
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