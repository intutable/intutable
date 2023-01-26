import { SxProps, Theme } from "@mui/system"
import { FlexboxSizing } from "@shared/input-masks/types"
import { CalculatedColumn } from "react-data-grid"
import { Column, Row } from "types"
import { ValueOf } from "utils/ValueOf"

export type CellEmptyValue = "" | null | undefined | []
export type Validatable = {
    /** Tells if the cell can interpret the value */
    isValid: <T = unknown>(value: T) => boolean
    /** Tells if the cell is empty. Must be implemented at the abstract class, because it should work for every type in the same way. */
    isEmpty: (value: unknown) => value is CellEmptyValue
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
     * Almost every cell type allows empty values.
     * Wrap this function around the de-/serialize function to catch those empty values.
     *
     * For empty values (null, undefined, "") it returns null
     */
    catchEmpty: <T extends ValueOf<Serializable>>(fn: T, value: unknown) => null | ReturnType<T>
}

export type ExposedInputProps<T = unknown, R = Record<string, unknown>> = {
    /** value */
    content: T
    row: Row
    column: Column.Deserialized | CalculatedColumn<Row>
    hoveringOnParent: boolean
    forwardProps?: R
    forwardSX?: SxProps<Theme>
    /** @default false */
    required?: boolean
    /** If specified, it will render an additional label near the input component */
    label?: string
    placeholder?: string
    tooltip?: string
}

export type ExposableInputComponent = {
    /**
     * Reference to the input component of the cell class.
     * Can be used outside the cell for other components.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ExposedInput: React.FC<ExposedInputProps>
}
