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
import { SvgIconComponent } from "@mui/icons-material"
import { ValueOf } from "utils/ValueOf"
import {
    Serializable,
    SerializableCatchEmpty,
    Exportable,
    Validatable,
} from "./protocols"

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

export type ExposedInputUpdateMode = "self" | "alien"
export type ExposedInputUpdate<MODE extends ExposedInputUpdateMode> =
    MODE extends "self"
        ? {
              mode: "self"
              row: Row
              column: Column.Deserialized | CalculatedColumn<Row>
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

type EditorOptions = NonNullable<Column.Deserialized["editorOptions"]>

export type CellEmptyValue = "" | null | undefined | []

/**
 * Base class for all cell components.
 * Extends the functionality of {@link SerializedCell} with React-specific
 * functionality that governs how to show the cell in the GUI.
 */
export abstract class Cell
    // TODO. make these static
    implements
        Validatable,
        Exportable,
        Serializable,
        SerializableCatchEmpty,
        ExposableInputComponent
{
    public abstract readonly brand: string
    public abstract label: string
    /** icon displayed with the type */
    public abstract icon: SvgIconComponent

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
    static isEmpty(value: unknown): value is CellEmptyValue {
        // empty values are: empty strings (""), null, undefined and empty arrays
        try {
            return (
                value === "" ||
                value == null ||
                typeof value === "undefined" ||
                (Array.isArray(value) && value.length === 0) ||
                (isJSONArray(value) && JSON.parse(value as string).length === 0)
            )
        } catch (error) {
            console.error(error)
            return false
        }
    }

    public catchEmpty<T extends ValueOf<Serializable>>(
        fn: T,
        value: unknown
    ): null | ReturnType<T> {
        if (
            value === null ||
            typeof value === "undefined" ||
            (typeof value === "string" && value === "")
        )
            return null
        return fn(value) as ReturnType<T>
    }
    public serialize(value: unknown): unknown {
        return value
    }
    public deserialize(value: unknown): unknown {
        return value
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

    /** override rdg's default properties for `editorOptions`. */
    // Note: before overring these, look up what the default values look like
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

    /** utilty that destructs the `props` argument for `editor` and `formatter` */
    protected destruct<T = unknown>(
        props: EditorProps<Row> | FormatterProps<Row>
    ) {
        const row = props.row
        const column = props.column
        const key = props.column.key as keyof Row
        const content = row[key] as T
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
