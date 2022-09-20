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

export interface Validatable {
    isValid: <T = unknown>(value: T) => boolean
}

export interface Exportable {
    export: <T = unknown>(value: T) => unknown
}

// export interface Convertable {
//     convert: <T extends CellType>(to: T) => T
// }

/**
 * Base class for all cell components.
 */
export default abstract class Cell implements Validatable, Exportable {
    /** unique identifier */
    public abstract readonly brand: string
    /** public name / no i18n yet */
    public abstract label: string

    /** override rdg's default properties for `editorOptions`. */
    // Note: before overring these, look up what the defaul values look like
    private _editorOptions: EditorOptions = {
        // Gets exposed to rdg internally. Needed for internal 'tab'/arrow key navigation.
        // Indicates what type of KeyboardEvent should be such a navigation event.
        onNavigation: ({ key }: React.KeyboardEvent<HTMLDivElement>): boolean =>
            key === "Tab",
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
                if (ref == null || typeof ref === "function") return

                const realRef: React.Ref<HTMLInputElement> =
                    typeof ref === "object" ? ref : inputRef

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

    /** used for validating its content */
    public abstract isValid(value: unknown): boolean

    /** used for file and clipboard export, override this method to change the behaviour  */
    public export(value: unknown): string | void {
        // default export method

        // if (typeof value !== "string" || typeof value !== "number")
        //     throw new Error(`Could not export value: ${value}`)

        return value as string
    }
}
