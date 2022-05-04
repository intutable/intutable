/**
 *
 */
export class IsTakenError extends Error {
    constructor(message: string, cause: Error | Response) {
        super(message, { cause: cause instanceof Error ? cause : undefined })
        this.name = this.constructor.name
    }
}
