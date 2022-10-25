import { Cell } from "../abstract"

export class Hyperlink extends Cell {
    readonly brand = "hyperlink"
    label = "Hyperlink"

    isValid(value: unknown): boolean {
        if (value == null || value === "") return true
        if (typeof value !== "string") return false

        try {
            new URL(value)
            return true
        } catch (e) {
            return false
        }
    }
}
