export {}

interface UClass {
    toString(): string
    valueOf(): number
    fromString(): unknown
}

abstract class Serialize {
    constructor() {}
    abstract test(): void
}
