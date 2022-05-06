import Obj from "types/Obj"
import { ErrorLike, isErrorLike } from "./ErrorLike"

const replacer = (key: string, value: unknown) => {
    // if value is the stack or cause, it needs to be serialized too
    if (value instanceof Error) {
        const error: Obj = {}

        Object.getOwnPropertyNames(value).forEach(prop => {
            Object.defineProperty(error, prop, {
                value: value[prop as keyof typeof value],
                writable: true,
                enumerable: true,
                configurable: true,
            })
        })

        return error
    }

    // other values
    return value
}

type Ctor<T> = { new (...args: unknown[]): T }
// type Ctor<T> = { new (): T }
type ErrorObject = ErrorLike

/**
 * Serializable Error Class
 */
export class SerializableError extends Error {
    constructor(...args: Parameters<typeof Error>) {
        super(...args)
        this.name = SerializableError.name
    }

    static fromJSON<T>(this: Ctor<T>, error: string): T | null {
        const parsed = JSON.parse(error)

        if (isErrorLike(parsed) === false) return null

        return new this(parsed)
    }

    /**
     * Serialize an error object to JSON.
     */
    static toJSON(error: Error): string {
        return JSON.stringify(error, replacer)
    }

    /**
     * This is just the same as `serialize`,
     * but it returns JSON instead of an plain object.
     */
    public toJSON(): string {
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
     * Serialize this error.
     */
    // public serialize(): ErrorObject {
    //     return SerializableError.serialize(this)
    // }

    /**
     * Serialize an error object.
     */
    // static serialize<T extends Error>(error: T): ErrorObject & keyof T {

    // }

    /**
     * Deserialize an error or error like object.
     */
    static deserialize<T>(this: Ctor<T>, error: ErrorObject): T {
        return new this() // TODO: implement
    }
}
