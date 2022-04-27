/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
    bail: true,
    clearMocks: true,
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/__tests__/*.test.ts"],
    watchman: true,
}
