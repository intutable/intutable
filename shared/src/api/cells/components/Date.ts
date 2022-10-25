import { TempusCell } from "../abstract"

export class Date extends TempusCell {
    readonly brand = "date"
    label = "Date"

    export(value: unknown): string | void {
        const parsed = this.parse(value as string)
        if (parsed == null) return
        return parsed.toLocaleDateString("de-DE", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        })
    }
}
