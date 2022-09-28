/* eslint-disable react/display-name */
import EditorComponent from "@datagrid/Cells/types/EditorComponent"
import { FormatterComponent } from "@datagrid/Cells/types/FormatterComponent"
import { InputUnstyled, InputUnstyledProps } from "@mui/base"
import { Box } from "@mui/material"
import { styled } from "@mui/material/styles"
import React from "react"
import { EditorProps, FormatterProps } from "react-data-grid"
import { Row } from "types"

class CellError extends Error {
    constructor(message: string) {
        super(message)

        this.name = CellError.name
        // this.cause =

        Error.captureStackTrace(this)
    }
}

const StyledInputElement = styled("input")`
    width: 100%;
    font-size: 1rem;
    font-family: Roboto, sans-serif;
    font-weight: 400;
    line-height: 1.4375em;
    background: transparent;
    padding: 6px 10px;
    color: #20262d;

    &:focus {
        outline: none;
    }
`

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

// export interface Convertable {
//     convert: <T extends CellType>(to: T) => T
// }

/**
 * Base class for all cell components.
 */
export default abstract class Cell
    implements Validatable, Exportable, Parsable
{
    /** unique identifier */
    public abstract readonly brand: string
    /** public name / no i18n yet */
    public abstract label: string

    /** utilty that destructs the `props` argument for `editor` and `formatter`
     * and automatically parses `content` by calling `parse` */
    protected destruct<T = ReturnType<typeof this.parse>>(
        props: EditorProps<Row> | FormatterProps<Row>
    ) {
        const row = props.row
        const column = props.column
        const key = props.column.key as keyof Row
        const content = this.parse(row[key]) as T
        return { row, column, key, content }
    }

    /** default input component */
    protected readonly Input = React.forwardRef(
        (
            props: InputUnstyledProps & {
                onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
            },
            ref?: React.Ref<HTMLInputElement>
        ) => (
            // default Input component, used in editor/formatter components
            <InputUnstyled
                components={{ Input: StyledInputElement }}
                ref={ref || props.ref}
                onKeyDown={props.onKeyDown}
                {...props}
            />
        )
    )

    /**
     *
     * If set to `null`, no editor will be rendered and the {@link ColumnUtility}
     * will set `editable` to `false` for the column.
     */
    public editor?: EditorComponent = (props: EditorProps<Row>) => {
        // default editor component
        const { row, key, content } = this.destruct(props)

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
            props.onRowChange({
                ...row,
                [key]: e.target.value,
            })

        return (
            <this.Input
                onChange={handleChange}
                onBlur={() => props.onClose(true)}
                value={content}
            />
        )
    }

    public formatter: FormatterComponent = (props: FormatterProps<Row>) => {
        // default formatter component
        const { row, column } = props

        const key = column.key as keyof Row
        const content = row[key] as string | null | undefined

        return <Box>{content}</Box>
    }

    public abstract isValid(value: unknown): boolean

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

    static Error = CellError
}
