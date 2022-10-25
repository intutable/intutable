import { NumericCell } from "../abstract"

export class Currency extends NumericCell {
    readonly brand = "currency"
    label = "Currency"

    export(value: unknown): string {
        return value + "€"
    }
    unexport(value: string): number {
        const unexported = Number(value.replace("€", "").trim())
        if (NumericCell.isNumeric(unexported) === false)
            throw new RangeError(
                "Currency Cell Debug Error: value is not a number"
            )
        return unexported
    }
}
