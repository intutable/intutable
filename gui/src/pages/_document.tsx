import React from "react"
import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from "next/document"
import { createEmotionCache } from "utils/createEmotionCache"
import createEmotionServer from "@emotion/server/types/create-instance"
import { AppType } from "next/app"
import { CustomAppProps } from "./_app"

class MyDocument extends Document {
    // compatible w/ SSG
    static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
        const originalRenderPage = ctx.renderPage

        const cache = createEmotionCache()
        const { extractCriticalToChunks } = createEmotionServer(cache)

        ctx.renderPage = () =>
            originalRenderPage({
                enhanceApp: App =>
                    function EnhanceApp(props) {
                        return <App emotionCache={cache} {...props} />
                    },
            })

        const initialProps = await Document.getInitialProps(ctx)

        const emotionStyles = extractCriticalToChunks(initialProps.html)
        const emotionStyleTags = emotionStyles.styles.map(style => (
            <style
                data-emotion={`${style.key} ${style.ids.join(" ")}`}
                key={style.key}
                dangerouslySetInnerHTML={{ __html: style.css }}
            />
        ))

        return {
            ...initialProps,
            emotionStyleTags,
        }
    }

    render() {
        return (
            <Html lang="en">
                <Head>{this.props.emotionStyleTags}</Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument
