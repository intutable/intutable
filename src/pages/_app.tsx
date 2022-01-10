import React, { useState, useMemo, useEffect } from "react"
import { getDesignToken, lightTheme } from "@theme"
import createTheme from "../theme/utils"
import Head from "next/head"
import { ThemeProvider } from "@mui/material/styles"
import { CssBaseline, useMediaQuery, PaletteMode } from "@mui/material"
import Layout from "@components/Layout/Layout"
import { SnackbarProvider } from "notistack"
import { AuthProvider } from "../context/AuthContext"
import type { AppProps } from "next/app"

const MyApp = (props: AppProps) => {
    const { Component, pageProps } = props

    // const systemPreferedThemeMode: PaletteMode = useMediaQuery("(prefers-color-scheme: dark)")
    //     ? "dark"
    //     : "light"

    // const [themeMode, setThemeMode] = useState<PaletteMode>(systemPreferedThemeMode)

    // const colorMode = useMemo(
    //     () => ({
    //         toggleColorMode: () => {
    //             setThemeMode((prevMode: PaletteMode) => (prevMode === "light" ? "dark" : "light"))
    //         },
    //     }),
    //     [themeMode]
    // )

    // const theme = useMemo(() => createTheme((() => getDesignToken(themeMode))()), [themeMode])

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
                <meta
                    name="theme-color"
                    content={lightTheme.palette.primary.main}
                />
            </Head>

            <AuthProvider>
                <ThemeProvider theme={lightTheme}>
                    <SnackbarProvider maxSnack={5}>
                        <CssBaseline />
                        <Layout>
                            <Component {...pageProps} />
                        </Layout>
                    </SnackbarProvider>
                </ThemeProvider>
            </AuthProvider>
        </>
    )
}

export default MyApp
