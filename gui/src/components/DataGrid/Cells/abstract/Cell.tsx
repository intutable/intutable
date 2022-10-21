/* eslint-disable react/display-name */
import EditorComponent from "@datagrid/Cells/types/EditorComponent"
import { FormatterComponent } from "@datagrid/Cells/types/FormatterComponent"
import { InputUnstyled, InputUnstyledProps } from "@mui/base"
import { Box, TextField } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useRow } from "hooks/useRow"
import React, { useEffect, useRef, useState } from "react"
import { CalculatedColumn, EditorProps, FormatterProps } from "react-data-grid"
import { Column, Row } from "types"
import { isJSONArray, isJSONObject } from "utils/isJSON"
import { mergeNonNullish } from "utils/mergeNonNullish"

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

type EditorOptions = NonNullable<Column["editorOptions"]>

export type ExposedInputUpdateMode = "self" | "alien"
export type ExposedInputUpdate<MODE extends ExposedInputUpdateMode> =
    MODE extends "self"
        ? {
              mode: "self"
              row: Row
              column: Column | CalculatedColumn<Row>
          }
        : {
              mode: "alien"
              onChange: (value: unknown) => void
          }
export type ExposedInputProps = {
    /**
     * If focus is lost, instead the formatted value will be displayed (formatter).
     * By clicking the value, the input component will be reactivated for editing (editor).
     *
     * @default true
     */
    keepFormatter?: boolean
    /**
     *
     */
    content?: unknown
    /**
     * 1: will update itself
     * 2: returns the (updated) value
     */
    update: ExposedInputUpdate<ExposedInputUpdateMode>
    sx?: null
}

export interface ExposableInputComponent {
    /**
     * Reference to the input component of the cell class.
     * Can be used outside the cell for other components.
     *
     * __Note__: This adapts the behaviour of native rdg cells and is NOT fully developed.
     * Bugs may occur.
     */
    ExposedInput: React.FC<ExposedInputProps>
    /**
     * Updates the cell's `value`. Can be used outside the cell in other components.
     */
    // update: (value: unknown) => void
}

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

/**
 * Base class to all cell components.
 */
export default abstract class Cell
    implements Validatable, Exportable, Parsable, ExposableInputComponent
{
    /** unique identifier */
    public abstract readonly brand: string
    /** public name / no i18n yet */
    public abstract label: string
    /** icon displayed with the type */
    public icon?: JSX.Element

    /** override rdg's default properties for `editorOptions`. */
    // Note: before overring these, look up what the defaul values look like
    private _editorOptions: EditorOptions = {
        // Gets exposed to rdg internally. Needed for internal 'tab'/arrow key navigation.
        // Indicates what type of KeyboardEvent should be such a navigation event.
        onNavigation: ({ key }: React.KeyboardEvent<HTMLDivElement>): boolean =>
            key === "Tab",
        editOnClick: true,
    }
    public get editorOptions() {
        return this._editorOptions
    }
    // merges `_editorOptions` with values set in child classes
    protected setEditorOptions(options: EditorOptions) {
        this._editorOptions = mergeNonNullish<EditorOptions>(
            this._editorOptions,
            options
        )
    }

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
        ) => {
            // if no ref is forwarded, we still need a ref for autofocus
            const inputRef = useRef<HTMLInputElement | null>(null)

            // autofocus effect
            useEffect(() => {
                if (typeof ref === "function") return

                const realRef: React.Ref<HTMLInputElement> = ref
                    ? ref
                    : inputRef

                this.autoFocusEditor(realRef.current)
            }, [ref])

            return (
                // default Input component, used in editor/formatter components
                <InputUnstyled
                    components={{ Input: StyledInputElement }}
                    ref={ref || inputRef}
                    onKeyDown={props.onKeyDown}
                    {...props}
                />
            )
        }
    )

    /**
     * Automatically focus the editor's input component when the editor
     * renders (i.e. cell's content is selected or edited). Since each editor
     * has different structure, the method for finding what element should
     * be focused also has to be configurable.
     * Note: if {@link this.editor} passes a callback ref into the `Input`,
     * the autofocus function will not run.
     */
    protected autoFocusEditor(input: HTMLInputElement | null) {
        if (input == null || input.children == null) return

        const domInput = Array.from(input.children).find(
            c => c.tagName.toLowerCase() === "input"
        )

        if (domInput == null || !(domInput instanceof HTMLInputElement)) return

        domInput.focus()
        domInput.select()
    }

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

    public ExposedInput = (props: ExposedInputProps) => {
        const { getRowId, updateRow } = useRow()

        const [content, setContent] = useState(props.content ?? "")

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setContent(e.target.value)
            if (props.update.mode === "alien") {
                const callback = props.update.onChange
                callback(e.target.value)
            }
        }

        const handleBlur = async () => {
            if (props.update.mode === "self") {
                const { row, column } = props.update
                await updateRow(column, getRowId(row), content)
            }
        }

        return (
            <TextField
                size="small"
                onChange={handleChange}
                onBlur={handleBlur}
                value={content}
            />
        )
    }

    static Error = CellError
}
