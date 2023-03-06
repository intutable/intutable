module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "prettier"],
    env: {
        node: true,
        browser: false,
    },
    rules: {
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-unused-vars": "warn",
        "no-unused-vars": "off", // disable default and use typescript-eslint instead
        "@typescript-eslint/no-namespace": "warn",
        "@typescript-eslint/no-empty-function": "warn",
        "no-empty-function": "off", // disable default and use typescript-eslint instead
        "prettier/prettier": [
            "warn",
            {
                endOfLine: "auto",
            },
        ],
        "@typescript-eslint/no-extra-semi": "off",
        "no-extra-semi": "off",
        "no-console": "off",
        "no-restricted-imports": [
            process.env.NODE_ENV === "production" ? "error" : "warn",
            {
                patterns: ["@mui/*/*/*", "!@mui/material/test-utils/*"],
            },
        ],
    },
    extends: [
        "eslint:recommended",
        "prettier",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
    ],
}
