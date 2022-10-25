import { TempusCell } from "../abstract/TempusCell"

export class Time extends TempusCell {
    readonly brand = "time"
    label = "Time"

    export(value: unknown): string | void {
        const parsed = this.parse(value as string)
        if (parsed == null) return
        return parsed.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }
}
