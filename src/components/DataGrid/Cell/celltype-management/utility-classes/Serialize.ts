export {}

interface UClass {
    toString(): string
    valueOf(): number
    fromString(): any
}

abstract class Serialize {
    constructor() {}
    abstract test(): void
}
