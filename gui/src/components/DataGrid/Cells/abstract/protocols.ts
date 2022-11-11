import { ValueOf } from "utils/ValueOf"

export type Validatable = {
    /** Tells if the cell can interpret the value */
    isValid: <T = unknown>(value: T) => boolean
    /** Tells if the cell is empty. Must be implemented at the abstract class, because it should work for every type. */
    // isEmpty: (value: unknown) => boolean
}

export type Exportable = {
    /** exports values, e.g. percentage '5' exports to '5%' */
    export: <T = unknown>(value: T) => unknown
    /**
     * Tries to revert the exported value to the raw value.
     *
     * @throws Should throw an error if the value is invalid.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unexport: (value: string) => any
}

export type Serializable = {
    /** Note: Ensure that if a serialized value gets serialized again, this should work (idempotent). */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    serialize: (value: any) => any
    /** Note: Ensure that if a deserialized value gets deserialized again, this should work (idempotent). */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deserialize: (value: any) => any
}

export type SerializableCatchEmpty = {
    /**
     *
     */
    catchEmpty: <T extends ValueOf<Serializable>>(
        fn: T,
        value: unknown
    ) => null | undefined | ReturnType<T>
}
