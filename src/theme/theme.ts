/**
 * @author Heidelberg University
 * @version 0.1.0
 * @file file.ts
 * @description description
 * @since date.month.2021
 * @license
 * @copyright © 2021 Heidelberg University
 */

// Node Modules

// Assets

// CSS

// Components

// Utils / Types / Api
import type { PaletteMode, Theme } from "@mui/material"
import createTheme from "./utils"

/**
 * `COLOR_SCHEME` is added to the theme via module augmentation in `./utils.ts`.
 * You can access added colors by `theme.colorScheme[STRING]`.
 */
export const COLOR_SCHEME = {

}

/**
 * Light Theme for the App
 */
export const lightTheme = createTheme({
    themeMode: "light",
    colorScheme: { ...COLOR_SCHEME },
    // palette: {
    //     mode: "light",
    //     primary: {
    //         main: "#ffffff",
    //         contrastText: "#333333"
    //     },
    //     secondary: {
    //         main: "#264653",
    //         // contrastText: ""
    //     },
    //     tonalOffset: 0.2,
    //     contrastThreshold: 3,
    //     // error: {
    //     //     main: red.A400
    //     // },
    //     // warning: {},
    //     // info: {},
    //     // success: {},
    //     text: {
    //         primary: "#333333",
    //         secondary: "#555555"
    //     },
    // },
    // typography: {
    //     fontFamily: "Roboto",
    //     fontSize: 12,
    //     h1: {
    //         fontSize: "3rem"
    //     },
    //     h2: {
    //         fontSize: "1.5rem"
    //     },
    //     h3: {
    //         fontSize: "1rem"
    //     },
    //     h4: {
    //         fontSize: "1rem"
    //     },
    //     h5: {
    //         fontSize: "1rem"
    //     },
    //     h6: {
    //         fontSize: "1rem"
    //     },
    //     caption: {}

    // },
})