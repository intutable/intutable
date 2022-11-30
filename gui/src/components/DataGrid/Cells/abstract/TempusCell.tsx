import { Cell } from "./Cell"
import { isValid as isValidTempus, parse as fns_parse } from "date-fns"
import deLocale from "date-fns/locale/de"
import { NumericCell } from "./NumericCell"

const parse_HH_mm = (str: string) =>
    fns_parse(str, "HH:mm", new Date(), {
        locale: deLocale,
    })

const parse_dd_MM_yyyy = (str: string) =>
    fns_parse(str, "dd.MM.yyyy", new Date(), {
        locale: deLocale,
    })

export abstract class TempusCell extends Cell {
    // https://date-fns.org/v2.29.3/docs/isValid
    static isValid(value: unknown): boolean {
        return value == null || value === "" || isValidTempus(value)
    }

    static serialize(value: Date): string {
        return value.getTime().toString()
    }
    static deserialize(value: unknown): Date {
        // case instance
        if (value instanceof Date && isValidTempus(value)) return value // catch invalid dates

        // case timestamp (string or number)
        if (NumericCell.isInteger(value)) {
            const timestamp = Number.parseInt(value as string)
            if (this.isValid(timestamp)) return new Date(timestamp)
        }

        throw new Error(`Could not deserialize value: ${value}`)
    }

    static unexport(value: string): Date {
        // TODO: implement
        throw new Error("Not Implemented")
    }

    /** Whether the value is a formatted time or date string,
     * if 'true', the parsed string is returned as Date object */
    static isFormattedString(value: unknown): Date | false {
        if (typeof value !== "string") return false

        // Note: https://github.com/date-fns/date-fns/blob/main/docs/unicodeTokens.md
        // https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table

        const isTime = parse_HH_mm(value)
        const isDate = parse_dd_MM_yyyy(value)

        return isValidTempus(isTime) ? isTime : isValidTempus(isDate) ? isDate : false
    }
}
