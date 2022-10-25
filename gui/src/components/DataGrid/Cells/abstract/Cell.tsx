/* eslint-disable react/display-name */
import EditorComponent from "@datagrid/Cells/types/EditorComponent"
import { FormatterComponent } from "@datagrid/Cells/types/FormatterComponent"
import { InputUnstyled, InputUnstyledProps } from "@mui/base"
import { Box } from "@mui/material"
import { styled } from "@mui/material/styles"
import React, { useRef, useEffect } from "react"
import { EditorProps, FormatterProps } from "react-data-grid"
import { Column, Row } from "types"
import { mergeNonNullish } from "utils/mergeNonNullish"
import {
    Validatable,
    Parsable,
    Exportable,
    Cell as SerializedCell,
} from "@shared/api/cells/abstract"

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

type EditorOptions = NonNullable<Column.Deserialized["editorOptions"]>

/**
 * Base class for all cell components.
 * Extends the functionality of {@link SerializedCell} with React-specific
 * functionality that governs how to show the cell in the GUI.
 */
export default abstract class Cell
    implements Validatable, Exportable, Parsable
{
    protected abstract serializedCellDelegate: SerializedCell

    public getBrand(): string {
        return this.serializedCellDelegate.getBrand()
    }
    public getLabel(): string {
        return this.serializedCellDelegate.getLabel()
    }

    public isValid(value: unknown): boolean {
        return this.serializedCellDelegate.isValid(value)
    }
    public parse(value: unknown): unknown {
        return this.serializedCellDelegate.parse(value)
    }
    public stringify(value: unknown): unknown {
        return this.serializedCellDelegate.stringify(value)
    }

    public export(value: unknown): string | void {
        return this.serializedCellDelegate.export(value)
    }
    // used in clipboard
    public unexport(value: string): unknown {
        return this.serializedCellDelegate.unexport(value)
    }

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

    static Error = CellError
}
