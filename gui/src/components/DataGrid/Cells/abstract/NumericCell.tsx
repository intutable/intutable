import Cell, { SerializedCell } from "@datagrid/Cells/abstract/Cell"

export abstract class NumericSerializedCell extends SerializedCell {
    isValid(value: unknown): boolean {
        return (
            value == null ||
            value === "" ||
            typeof value === "number" ||
            NumericCell.isNumeric(value)
        )
    }    
    parse(value: string | number | null | undefined): number | null {
        if (typeof value === "undefined" || value === null || value === "")
            return null

        if (typeof value === "number") return value

        if (typeof value === "string") {
            const int = Number.parseInt(value)
            if (isNaN(int) === false) return int
            const float = Number.parseFloat(value)
            if (isNaN(float) === false) return float
        }

        return null
    }

    unexport(value: number | string): number | null {
        return this.parse(value)
    }
}

export abstract class NumericCell extends Cell {
    protected abstract serializedCellDelegate: NumericSerializedCell

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
