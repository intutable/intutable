import { Cell } from "../abstract"

export class MultiSelect extends Cell {
    readonly brand = "multiselect"
    label = "Mehrfach-Auswahlliste"

    isValid(value: unknown): boolean {
        return Array.isArray(value) && value.every(v => typeof v === "string")
    }

    parse(value: unknown): string[] {
        if (value == null) return []
        if (Array.isArray(value)) return value

        if (typeof value === "string") {
            try {
                const jsonparsed = JSON.parse(value ?? "[]")
                if (Array.isArray(jsonparsed)) return jsonparsed
            } catch (e) {
                return [value]
            }
        }

        return []
    }
    stringify(value: string[]): string {
        return JSON.stringify(value)
    }
    export(value: unknown): string | void {
        if (value == null || value === "") return

        const arr = this.parse(value as string)
        if (Array.isArray(arr)) return arr.join(";")

        return
    }
    unexport(value: string): string[] {
        return value.split(";")
    }
}
