import { Cell } from "@datagrid/Cells/abstract/Cell"

export abstract class NumericCell extends Cell {
    static isValid(value: unknown): boolean {
        return value == null || value === "" || typeof value === "number" || NumericCell.isNumeric(value)
    }
    static serialize(value: number): number {
        return value
    }
    static deserialize(value: unknown): number {
        if (typeof value === "number") return value
        if (NumericCell.isNumeric(value)) {
            const int = Number.parseInt(value as string)
            if (isNaN(int) === false) return int
            const float = Number.parseFloat(value as string)
            if (isNaN(float) === false) return float
        }
        throw new Error(`Could not deserialize value: ${value}`)
    }

    static unexport(value: number | string): number | null {
        // TODO: implement
        throw new Error("Not Implemented")
    }

    static isInteger(str: unknown): boolean {
        if (typeof str === "number") return true
        if (typeof str !== "string") return false

        const int = Number.parseInt(str)
        const isInt = isNaN(int) === false

        return isInt
    }

    static isFloat(str: unknown): boolean {
        if (typeof str === "number") return true
        if (typeof str !== "string") return false

        const float = Number.parseFloat(str)
        const isFloat = isNaN(float) === false

        return isFloat
    }

    static isNumeric(str: unknown): boolean {
        if (typeof str === "number") return true
        if (typeof str !== "string") return false

        return NumericCell.isInteger(str) || NumericCell.isFloat(str)
    }
}
