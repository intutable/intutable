/**
 * @author Heidelberg University
 * @version 0.1.0
 * @file _document.tsx
 * @description Custom Next `Document` Page.
 * @since 29.09.2021
 * @license
 * @copyright © 2021 Heidelberg University
 */

// Node Modules
import React from "react"
import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document"

// Assets

// CSS

// Components

// Utils / Types / Api


class MyDocument extends Document {

    // compatible w/ SSG
    static async getInitialProps(ctx: DocumentContext) {

        // Resolution order
        //
        // On the server:
        // 1. app.getInitialProps
        // 2. page.getInitialProps
        // 3. document.getInitialProps
        // 4. app.render
        // 5. page.render
        // 6. document.render
        //
        // On the server with error:
        // 1. document.getInitialProps
        // 2. app.render
        // 3. page.render
        // 4. document.render
        //
        // On the client
        // 1. app.getInitialProps
        // 2. page.getInitialProps
        // 3. app.render
        // 4. page.render

        const originalRenderPage = ctx.renderPage

        // TODO: implement emotion cache

        const initialProps = await Document.getInitialProps(ctx)
        return { ...initialProps, styles: [...React.Children.toArray(initialProps.styles)] }
    }

    render() {

        return (
            <Html lang="en">
                <Head>
                    {/* Normally those meta tags a here, instead look into _app.tsx */}
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument