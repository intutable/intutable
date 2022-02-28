import Layout from "components/Layout/Layout"
import { CssBaseline, PaletteMode, useMediaQuery } from "@mui/material"
import { ThemeProvider } from "@mui/material/styles"
import { getDesignToken } from "theme"
import type { AppProps } from "next/app"
import Head from "next/head"
import { SnackbarProvider } from "notistack"
import React, { useEffect, useMemo, useState } from "react"
import { AuthProvider } from "context"
import createTheme from "theme/utils"
import { parseResponse, logger } from "api/middelware"
import { SWRConfig } from "swr"

type ThemeTogglerContextProps = {
    toggleColorMode: () => void
    getTheme: () => PaletteMode
}
const ThemeTogglerContext = React.createContext<ThemeTogglerContextProps>(
    undefined!
)
export const useThemeToggler = () => React.useContext(ThemeTogglerContext)
export const THEME_MODE_STORAGE_KEY = "__USER_THEME_PREFERENCE__"

const MyApp = (props: AppProps) => {
    const { Component, pageProps } = props

    const systemPreferredThemeMode: PaletteMode = useMediaQuery(
        "(prefers-color-scheme: dark)"
    )
        ? "dark"
        : "light"

    const [themeMode, setThemeMode] = useState<PaletteMode>(
        systemPreferredThemeMode
    )

    useEffect(() => {
        const userPreferredThemeMode = localStorage.getItem(
            THEME_MODE_STORAGE_KEY
        )
        setThemeMode(
            (userPreferredThemeMode as PaletteMode) || systemPreferredThemeMode
        )
    }, [systemPreferredThemeMode])

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setThemeMode((prevMode: PaletteMode) =>
                    prevMode === "light" ? "dark" : "light"
                )
            },
            getTheme: () => themeMode,
        }),
        [themeMode]
    )

    const theme = useMemo(
        () => createTheme((() => getDesignToken(themeMode))()),
        [themeMode]
    )

    return (
        <>
            <Head>
                {/* Responsive */}
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <meta charSet="utf-8" />
                {/* Favicons */}
                <link rel="icon" type="image/png" href="/favicon.ico" />
                {/* Safari Tab Bar Style */}
                <meta name="theme-color" content={theme.palette.primary.main} />
            </Head>

            <AuthProvider>
                <SWRConfig value={{ use: [logger, parseResponse] }}>
                    <ThemeTogglerContext.Provider value={colorMode}>
                        <ThemeProvider theme={theme}>
                            <SnackbarProvider maxSnack={5}>
                                <CssBaseline />
                                <Layout>
                                    <Component {...pageProps} />
                                </Layout>
                            </SnackbarProvider>
                        </ThemeProvider>
                    </ThemeTogglerContext.Provider>
                </SWRConfig>
            </AuthProvider>
        </>
    )
}

export default MyApp
