const replacer = (key: string, value: unknown) => {
    if (value instanceof Error) {
        const error: Record<string, unknown> = {}

        Object.getOwnPropertyNames(value).forEach(propName => {
            error[propName] = value[propName as keyof typeof value]
        })

        return error
    }

    return value
}

type Ctor<T> = { new (): T }

export class SerializableError extends Error {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options)
        this.name = this.constructor.name
    }

    public toString(): string {
        return this.serialize()
    }

    get [Symbol.toStringTag](): string {
        return this.name
    }

    [Symbol.toPrimitive](): string {
        return this.serialize()
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
    public serialize(): string {
        return JSON.stringify(this, replacer)
    }

    /**
     * Deserialize an error object
     */
    static deserialize<T>(this: Ctor<T>, error: string): T {
        return new this() // TODO: implement
    }
}
