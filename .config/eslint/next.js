const { resolve } = require("node:path")

const project = resolve(process.cwd(), "tsconfig.json")

module.exports = {
    extends: [
        "eslint:recommended",
        "next/core-web-vitals",
        "plugin:@typescript-eslint/recommended-type-checked",
        "prettier"
    ],
    parserOptions: {
        project
    },
    env: {
        browser: true,
        jest: true
    },
    globals: {
        React: true,
        JSX: true
    },
    settings: {
        "import/resolver": {
            typescript: {
                project
            }
        },
        next: {
            rootDir: "./apps/intutable-ui"
        }
    },
    ignorePatterns: ["node_modules/", "dist/"],
    rules: {
        "import/no-default-export": "off"
    }
}
