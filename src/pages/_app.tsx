import type { AppProps } from "next/app"
import { theme } from "@theme"
import Head from "next/head"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { CssBaseline } from "@mui/material"
import Layout from "@components/Layout/Layout"
import { SnackbarProvider } from "notistack"
import { AuthProvider } from "@context/AuthContext"

const MyApp = (props: AppProps) => {
    const { Component, pageProps } = props
    return (
        <>
            <Head>
                {/* Responsive */}
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta charSet="utf-8" />
                {/* Favicons */}
                <link rel="icon" type="image/png" href="/favicon.ico" />
                {/* Safari Tab Bar Style */}
                <meta name="theme-color" content={theme.palette.primary.main} />
            </Head>

            <AuthProvider>
                <ThemeProvider theme={theme}>
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
