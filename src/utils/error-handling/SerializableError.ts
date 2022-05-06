import { ErrorLike } from "./ErrorLike"

const replacer = (key: string, value: unknown) => {
    if (value instanceof Error) {
        const error: Record<string, unknown> = {}

        Object.getOwnPropertyNames(value).forEach(prop => {
            Object.defineProperty(error, prop, {
                value: value[prop as keyof typeof value],
                writable: true,
                enumerable: true,
            })
        })

        return error
    }

    return value
}

type Ctor<T> = { new (...args: unknown[]): T }

/**
 * Serializable Error Class
 */
export class SerializableError extends Error {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options)
        this.name = this.constructor.name
    }

    /**
     * Serialize an error object to JSON
     */
    static toJSON(error: Error): string {
        return JSON.stringify(error, replacer)
    }

    /**
     * This is just the same as `serialize`,
     * but it returns JSON instead of an plain object.
     */
    public toJSON() {
        return JSON.stringify(this, replacer)
    }

    // static [Symbol.hasInstance]<T>(this: Ctor<T>, instance: unknown): boolean {
    //     if (typeof instance !== "string") return false
    //     try {
    //         const deserialized = SerializableError.deserialize(instance)
    //         if (deserialized.name !== this.name) return false
    //         return true
    //     } catch {
    //         return false
    //     }
    // }

    /**
     * Serialize the error
     */
    public serialize() {
        return SerializableError.serialize(this)
    }

    /**
     * Serialize an error object
     */
    static serialize<T extends Error>(error: T): ErrorLike & T {}

    /**
     * Deserialize an error or error like object
     */
    static deserialize<T>(this: Ctor<T>, error: ErrorLike): T {
        return new this() // TODO: implement
    }
}
