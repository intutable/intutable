import { isJSONArray, isJSONObject } from "../../../utils/isJSON"

// TODO: make this a static method, this increases performance
export interface Validatable {
    /** validates parsed values – doesn't parse values for you */
    isValid: <T = unknown>(value: T) => boolean
}
// TODO: make this a static method, this increases performance
export interface Exportable {
    /** exports parsed values, e.g. percentage '5' exports to '5%' */
    export: <T = unknown>(value: T) => unknown
    /**
     * Tries to revert the exported value to the original value.
     *
     * @throws Should throw an error if the value is invalid.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unexport: (value: string) => any
}

// TODO: make this a static method, this increases performance
// TODO: replace 'any'
export interface Parsable {
    /**
     * Parses values for the class that come directly from the db
     * e.g. dates are saved as timestamps and get converted to Date objects.
     *
     * @throws Should throw an error if the value is invalid.
     *
     * Note: Ensure that if a parsed value gets parsed again, this should work (idempotent).
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parse: (value: any) => any
    /**
     * Turns parsed values back into a format for the db.
     *
     * @throws Should throw an error if the value is invalid.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stringify: (value: any) => any
}

export abstract class Cell implements Validatable, Exportable, Parsable {
    /** unique identifier */
    protected abstract readonly brand: string
    public getBrand(): string {
        return this.brand
    }

    /** public name / no i18n yet */
    protected abstract label: string
    public getLabel(): string {
        return this.label
    }

    public isValid(value: unknown): boolean {
        // default validation for text based editors
        // it should either be a non object like string, a stringified number or emtpy (null or empty str '')
        return (
            (isJSONObject(value) === false &&
                isJSONArray(value) === false &&
                typeof value === "string") ||
            typeof value === "number" ||
            value === "" ||
            value == null
        )
    }

    public parse(value: unknown): unknown {
        return value // default is to just return the value and don't parse it
    }
    public stringify(value: unknown): unknown {
        return value // default is to just return the value and don't unparse it
    }

    public export(value: unknown): string | void {
        // default export method
        // if (typeof value !== "string" || typeof value !== "number")
        //     throw new Error(`Could not export value: ${value}`)
        return value as string
    }
    // used in clipboard
    public unexport(value: string): unknown {
        return value
    }
}
