import createEmotionServer from "@emotion/server/create-instance"
import Document, { Head, Html, Main, NextScript } from "next/document"
import { createEmotionCache } from "utils/createEmotionCache"

class MyDocument extends Document {
    render() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emotionStyleTags = (this.props as any).emotionStyleTags

        return (
            <Html lang="de">
                <Head>
                    {/* <meta name="theme-color" content={theme.palette.primary.main} />
                    <link rel="shortcut icon" href="/favicon.ico" /> */}

                    <meta name="emotion-insertion-point" content="" />
                    {emotionStyleTags}
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

MyDocument.getInitialProps = async ctx => {
    const originalRenderPage = ctx.renderPage

    const cache = createEmotionCache()
    const { extractCriticalToChunks } = createEmotionServer(cache)

    ctx.renderPage = () =>
        originalRenderPage({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            enhanceApp: (App: any) =>
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

export default MyDocument
