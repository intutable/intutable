import { Column } from "types"

// const isProxy = Symbol("isProxy") // https://stackoverflow.com/questions/36372611/how-to-test-if-an-object-is-a-proxy

export class ColumnUpdate<K extends keyof Column.Serialized> {
    constructor(attribute: K, value: Column.Serialized[K]) {}

    public isAllowed(): boolean {
        return true
    }
}
