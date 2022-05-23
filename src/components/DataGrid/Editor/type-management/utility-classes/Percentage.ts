/**
 * "50%" / "0.5" / "1/2"
 */
export type PercentageFormat = "percent" | "decimal" | "fraction"

/**
 * @class Percentage
 *
 */
export class Percentage {
    /**
     *
     */
    _format: PercentageFormat = "percent"
    /**
     * saved as floating point number from 0 to 100
     */
    _value: number

    /**
     *
     * @param {PercentageFormat} format Percentage format, default 'percent'
     * @param {number} value
     */
    constructor(format: PercentageFormat, value: number) {
        this._format = format
        this._value = value
    }

    get format() {
        return this._format
    }
    set format(format: PercentageFormat) {
        this._format = format
    }
    get value() {
        return this._value
    }
    set value(value: number) {
        if (value >= 0 && value <= 100) this._value = value
    }

    // TODO: add round func
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toFormattedString(decimalPlaces = 0): string {
        switch (this._format) {
            case "percent":
                return `${this._value} %`
            case "decimal":
            case "fraction":
            default:
                return "not implemented"
        }
    }

    toString() {
        return this._value.toString()
    }

    valueOf() {
        return this._value
    }

    // TODO: implement
    // [Symbol.toPrimitive](hint: "string" | "number" | "default"): number | string {
    //     switch (hint) {
    //         case "string":
    //             return this._value.toString()
    //         case "number":
    //         case "default":
    //         default:
    //             return this._value
    //     }
    // }

    // static [Symbol.hasInstance](instance: unknown): boolean {
    //     switch (typeof instance) {
    //         case "number":
    //             return true

    //         case "string":
    //             if (instance.length > 1 && !Number.isNaN(Number(instance))) return true
    //             else {
    //                 // TODO: check if string is currency with regex
    //                 return false
    //             }

    //         default:
    //             return false
    //     }
    // }
}
