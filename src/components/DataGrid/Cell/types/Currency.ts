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

export class Currency {
    /**
     * Currency format
     * @default EURO
     */
    _format: CurrencyFormat = "EURO"
    _value: number

    /**
     *
     * @param {CurrencyFormat} format Currency format
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

    [Symbol.toPrimitive](hint: unknown) {
        switch (hint) {
            default:
                return `${this._value} ${CurrencyFormatSymbolMap[this._format]}`
        }
    }
    static [Symbol.hasInstance](instance: any) {}
}
