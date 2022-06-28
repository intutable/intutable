// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
})
/** @type {import('next').NextConfig} */
module.exports = withBundleAnalyzer({
    reactStrictMode: true,
    swcMinify: true,
    compress: true,
    serverRuntimeConfig: {
        ironAuthSecret: process.env.IRON_AUTH_SECRET,
    },
    // publicRuntimeConfig: {},
    eslint: {
        // Warning: This allows production builds to successfully complete if set to 'true' even if
        // the project has ESLint errors.
        ignoreDuringBuilds: false,
    },
    compiler: { removeConsole: true },
    // experimental: {
    //     concurrentFeatures: true,
    // }, // BUG: breaks the app
    // productionBrowserSourceMaps: true,
})
