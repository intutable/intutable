/* eslint-disable react/display-name */
import EditorComponent from "@datagrid/Cells/types/EditorComponent"
import { FormatterComponent } from "@datagrid/Cells/types/FormatterComponent"
import { InputUnstyled, InputUnstyledProps } from "@mui/base"
import { Box } from "@mui/material"
import { styled } from "@mui/material/styles"
import React from "react"
import { EditorProps, FormatterProps } from "react-data-grid"
import { Row } from "types"

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

export interface Validatable {
    isValid: <T = unknown>(value: T) => boolean
}

export interface Exportable {
    export: <T = unknown>(value: T) => unknown
}

// export interface Convertable {
//     convert: <T extends CellType>(to: T) => T
// }

export default abstract class Cell implements Validatable, Exportable {
    public abstract readonly brand: string
    public abstract label: string

    protected destruct<T = unknown>(
        props: EditorProps<Row> | FormatterProps<Row>
    ) {
        const row = props.row
        const column = props.column
        const key = props.column.key as keyof Row
        const content = row[key] as T
        return { row, column, key, content }
    }

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

    public export(value: unknown): unknown {
        // default export method
        return value
    }
}
