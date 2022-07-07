// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
})

// @ts-check
/** @type {import('next').NextConfig} */
module.exports = withBundleAnalyzer({
    reactStrictMode: true,
    // compress: true,
    serverRuntimeConfig: {
        ironAuthSecret: process.env.IRON_AUTH_SECRET,
    },
    // publicRuntimeConfig: {},
    // swcMinify: true, // experimental – does not work
    eslint: {
        ignoreDuringBuilds: true,
    },
    compiler: { removeConsole: true },
    // experimental: {
    // should improve the mui imports but does not work yet
    // modularizeImports: {
    //     "@mui/material/?(((\\w*)?/?)*)": {
    //         transform: "@mui/material/{{ matches.[1] }}/{{member}}",
    //     },
    //     "@mui/icons-material/?(((\\w*)?/?)*)": {
    //         transform: "@mui/icons-material/{{ matches.[1] }}/{{member}}",
    //     },
    // },
    // },
})
