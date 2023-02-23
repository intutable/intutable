/** If the condition fails, this will be displayed if provided */
export type Mismatch = {
    title: string
    severity: "error" | "warning" | "info"
    message: string
    howToSolve: string
}
