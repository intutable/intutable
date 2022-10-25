import { NumericCell } from "../abstract/NumericCell"

export class Percentage extends NumericCell {
    readonly brand = "percentage"
    label = "Percentage"

    isValid(value: unknown): boolean {
        if (typeof value === "string" && NumericCell.isNumeric(value)) {
            const number = NumericCell.isInteger(value)
                ? Number.parseInt(value)
                : Number.parseFloat(value)
            return number >= 0 && number <= 100
        }
        return (
            (typeof value === "number" && value >= 0 && value <= 100) ||
            value == null ||
            value === ""
        )
    }

    export(value: unknown): string {
        return value + "%"
    }
    unexport(value: string): number {
        const unexported = Number(value.replace("%", "").trim())
        if (NumericCell.isNumeric(unexported) === false)
            throw new RangeError(
                "Percentage Cell Debug Error: value is not a number"
            )
        return unexported
    }
}
