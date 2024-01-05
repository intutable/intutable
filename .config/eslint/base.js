const { resolve } = require("node:path")

const project = resolve(process.cwd(), "tsconfig.json")

module.exports = {
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
        "prettier"
    ],
    plugins: ["@typescript-eslint"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project
    },
    settings: {
        "import/resolver": {
            typescript: {
                project
            }
        }
    },
    ignorePatterns: ["node_modules/", "dist/"]
}
