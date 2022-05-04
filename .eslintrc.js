module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "prettier"],
    rules: {
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-unused-vars":
            process.env.NODE_ENV === "production" ? "error" : "warn",
        "no-unused-vars": "off", // disable default and use typescript-eslint instead
        "@typescript-eslint/no-namespace":
            process.env.NODE_ENV === "production" ? "warn" : "off",
        "@typescript-eslint/no-empty-function":
            process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-empty-function": "off", // disable default and use typescript-eslint instead
        "prettier/prettier": "error",
        "@typescript-eslint/no-extra-semi": "off",
        "no-extra-semi": "off",
        "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "error",
    },
    extends: [
        "next/core-web-vitals",
        "eslint:recommended",
        "next",
        "prettier",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
    ],
}
