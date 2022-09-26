import Cell from "../abstract/Cell"

export class Text extends Cell {
    readonly brand = "string"
    label = "Text"

    isValid(value: unknown) {
        return typeof value === "string" || typeof value === "number"
    }
}
