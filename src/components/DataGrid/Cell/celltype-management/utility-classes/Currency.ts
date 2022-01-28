export const CurrencyFormatSymbolMap = {
    EURO: "€",
    DOLLAR: "$",
    YEN: "¥",
    POUND: "£",
    RUBLE: "₽",
    WON: "₩",
}

/**
 * Currency format
 * @default EURO
 */
export type CurrencyFormat = keyof typeof CurrencyFormatSymbolMap

/**
 * @class Currency
 *
 */
export class Currency {
    _format: CurrencyFormat = "EURO"
    _value: number

    /**
     *
     * @param {CurrencyFormat} format Currency format, default EURO
     * @param {number} value amount
     */
    constructor(format: CurrencyFormat, value: number) {
        this._format = format
        this._value = value
    }

    get format() {
        return this._format
    }
    set format(format: CurrencyFormat) {
        this._format = format
    }
    get value() {
        return this._value
    }
    set value(value: number) {
        this._value = value
    }

    add(amount: number) {
        this._value += amount
    }

    subtract(amount: number) {
        this._value -= amount
    }

    // TODO: add round func
    toFormattedString(decimalPlaces: number = 0): string {
        return `${this._value} ${CurrencyFormatSymbolMap[this._format]}`
    }

    toString() {
        return this._value.toString()
    }

    valueOf() {
        return this._value
    }

    [Symbol.toPrimitive](
        hint: "string" | "number" | "default"
    ): number | string {
        switch (hint) {
            case "string":
                return this._value.toString()
            case "number":
            case "default":
            default:
                return this._value
        }
    }

    static [Symbol.hasInstance](instance: unknown): boolean {
        switch (typeof instance) {
            case "number":
                return true

            case "string":
                if (instance.length > 1 && !Number.isNaN(Number(instance)))
                    return true
                else {
                    // TODO: check if string is currency with regex
                    return false
                }

            default:
                return false
        }
    }
}
