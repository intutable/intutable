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
        dirs: ["src"],
        ignoreDuringBuilds: true,
    },
    compiler: { removeConsole: false },
    experimental: {
        modularizeImports: {
            // components
            "@mui/material": {
                transform: "@mui/material/{{member}}",
            },
            // "@mui/material/?(((\\w*)?/?)*)": {
            //     transform: "@mui/material/{{ matches.[1] }}/{{member}}",
            // },
            // icons
            "@mui/icons-material": {
                transform: "@mui/icons-material/{{member}}",
            },
            // "@mui/icons-material/?(((\\w*)?/?)*)": {
            //     transform: "@mui/icons-material/{{ matches.[1] }}/{{member}}",
            // },
        },
    },
})
