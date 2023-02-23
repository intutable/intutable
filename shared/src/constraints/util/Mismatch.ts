/** If the condition fails, this will be displayed if provided */
export type Mismatch = {
    title: string
    severity: "error" | "warn" | "info"
    message: string
    howToSolve: string
}
