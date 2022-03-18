export const makeError = (error: unknown): Error =>
    error instanceof Error
        ? error
        : typeof error === "string"
        ? new Error(error)
        : new Error("Unknown Error")
