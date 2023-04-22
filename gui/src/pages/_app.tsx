import { CacheProvider, EmotionCache } from "@emotion/react"
import ErrorIcon from "@mui/icons-material/Error"
import { CssBaseline, PaletteMode, Theme, useMediaQuery } from "@mui/material"
import { ThemeProvider } from "@mui/material/styles"
import { fetcher } from "api"
import { deserializeView, logger } from "api/middelware"
import Layout from "components/Layout/Layout"
import { UndoContextProvider } from "context/UndoContext"
import { useUserSettings } from "hooks/useUserSettings"
import type { AppProps } from "next/app"
import Head from "next/head"
import { SnackbarProvider } from "notistack"
import React, { useMemo } from "react"
import { SWRConfig } from "swr"
import { getTheme } from "theme"
import { createEmotionCache } from "utils/createEmotionCache"

const clientSideEmotionCache = createEmotionCache()

interface MyAppProps extends AppProps {
    emotionCache?: EmotionCache
}

const MyApp = (props: MyAppProps) => {
    const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

    const { userSettings } = useUserSettings()

    const systemPreferredThemeMode: PaletteMode = useMediaQuery("(prefers-color-scheme: dark)")
        ? "dark"
        : "light"

    const theme = useMemo(() => {
        const userPreferredTheme = userSettings?.preferredTheme ?? "system"

        const themeMode: PaletteMode =
            userPreferredTheme === "system" ? systemPreferredThemeMode : userPreferredTheme

        return getTheme(themeMode)
    }, [systemPreferredThemeMode, userSettings?.preferredTheme])

    return (
        <CacheProvider value={emotionCache}>
            <Head>
                {/* Responsive */}
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta charSet="utf-8" />
                {/* Favicons */}
                <link rel="shortcut icon" href="/favicon.ico" />
                {/* Safari Tab Bar Style */}
                <meta name="theme-color" content={theme.palette.primary.main} />
            </Head>

            <SWRConfig
                value={{
                    fetcher: fetcher,
                    use: [logger, deserializeView],
                    onError: err => console.error(err),
                    // suspense: true, // not supported for ssr as of now
                    revalidateOnFocus: false,
                }}
            >
                <ThemeProvider theme={theme}>
                    <SnackbarProvider
                        autoHideDuration={2500}
                        maxSnack={5}
                        dense
                        preventDuplicate
                        iconVariant={{
                            error: <ErrorIcon fontSize="small" sx={{ mr: 1 }} />,
                        }}
                    >
                        <UndoContextProvider>
                            <CssBaseline />
                            <Layout>
                                <Component {...pageProps} />
                            </Layout>
                        </UndoContextProvider>
                    </SnackbarProvider>
                </ThemeProvider>
            </SWRConfig>
        </CacheProvider>
    )
}

export default MyApp
