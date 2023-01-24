/* eslint-disable react/display-name */
import EditorComponent from "@datagrid/Cells/types/EditorComponent"
import { FormatterComponent } from "@datagrid/Cells/types/FormatterComponent"
import { InputUnstyled, InputUnstyledProps } from "@mui/base"
import { SvgIconComponent } from "@mui/icons-material"
import AbcIcon from "@mui/icons-material/Abc"
import { Box } from "@mui/material"
import { styled } from "@mui/material/styles"
import React, { useEffect, useRef } from "react"
import { EditorProps, FormatterProps } from "react-data-grid"
import { Column, Row } from "types"
import { ColumnFactory } from "utils/column utils/ColumnFactory"
import { isJSONArray, isJSONObject } from "utils/isJSON"
import { mergeNonNullish } from "utils/mergeNonNullish"
import { static_implements } from "utils/static_implements"
import { ValueOf } from "utils/ValueOf"
import {
    CellEmptyValue,
    Exportable,
    ExposableInputComponent,
    ExposedInputProps,
    Serializable,
    SerializableCatchEmpty,
    Validatable,
} from "./protocols"

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Ctor<T> = new (column: Column.Serialized, ...args: any[]) => T
export type CellInstanceImplements = {
    /** display name, visible to the user; can be changed during runtime (e.g. for i18n) */
    label: string
    /** corresponding icon */
    icon: SvgIconComponent
    /** unique identifier; do NOT change in production */
    brand: string
    /** Wether the cell type is appropriate for the `isUserPrimiaryKey` column, @default true */
    canBeUserPrimaryKey: boolean
    /**
     * Readonly Components (e.g. Lookups are editable indirectly ~ 'readonly' – as well as Links)
     * The difference between `editable` and `isReadonlyComponent` is that both inputs are readonly,
     * but only `editable === false` is disabled. ReadOnly Inputs can be focused, but the value can not be changed.
     */
    isReadonlyComponent: boolean
    /** Use the Link Formatter Component (for Links Columns, but not Lookups), does not matter wether it is readonly */
    useLinkFormatter: boolean
} & ExposableInputComponent
export type CellStatic = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (column: Column.Serialized, ...args: any[]): CellInstanceImplements
} & Validatable &
    Exportable &
    Serializable &
    SerializableCatchEmpty

/**
 * Abstract base class for all cell components.wd
 */
@static_implements<CellStatic>()
export class Cell {
    constructor(public readonly column: Column.Serialized) {
        this.isReadonlyComponent = ["link", "lookup", "backwardLink"].includes(column.kind)
        this.useLinkFormatter = column.kind === "link"

        if (this.useLinkFormatter && this.canBeUserPrimaryKey === false)
            throw new Error("Component cannot be used as a link")
    }

    public isReadonlyComponent = true
    public useLinkFormatter = false
    public brand = "abstract-cell"
    public label = "Abstract Cell"
    public icon: SvgIconComponent = AbcIcon
    public canBeUserPrimaryKey = true

    /***** - UTILS - *****/

    /** override rdg's default properties for `editorOptions`. */
    private _editorOptions: EditorOptions = {
        // Gets exposed to rdg internally. Needed for internal 'tab'/arrow key navigation.
        // Indicates what type of KeyboardEvent should be such a navigation event.
        onNavigation: ({ key }: React.KeyboardEvent<HTMLDivElement>): boolean => key === "Tab",
        editOnClick: this.isReadonlyComponent === false,
    }
    public get editorOptions() {
        return this._editorOptions
    }
    // merges `_editorOptions` with values set in child classes
    protected setEditorOptions(options: EditorOptions) {
        this._editorOptions = mergeNonNullish<EditorOptions>(this._editorOptions, options)
    }
    /** utilty that destructs the `props` argument for `editor` and `formatter` */
    protected destruct<T = unknown>(props: EditorProps<Row> | FormatterProps<Row>) {
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

            // TODO: use the autofocus mechanism in other cell components as well
            // autofocus effect
            useEffect(() => {
                if (typeof ref === "function") return

                const realRef: React.Ref<HTMLInputElement> = ref ? ref : inputRef

                this.autoFocusEditor(realRef.current)
            }, [ref])

            return (
                // default Input component, used in editor/formatter components
                <InputUnstyled
                    components={{ Input: StyledInputElement }}
                    ref={ref || inputRef}
                    onKeyDown={props.onKeyDown}
                    disabled={this.column.editable === false}
                    readOnly={this.isReadonlyComponent}
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

        const domInput = Array.from(input.children).find(c => c.tagName.toLowerCase() === "input")

        if (domInput == null || !(domInput instanceof HTMLInputElement)) return

        domInput.focus()
        domInput.select()
    }

    /***** {@link Validatable} *****/
    static isValid(value: unknown): boolean {
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
        try {
            return (
                value === "" ||
                value == null ||
                typeof value === "undefined" ||
                (Array.isArray(value) && value.length === 0) ||
                (isJSONArray(value) && JSON.parse(value as string).length === 0)
            )
        } catch (error) {
            return false
        }
    }

    /***** {@link Serializable} *****/

    static serialize(value: unknown): unknown {
        return value
    }
    static deserialize(value: unknown): unknown {
        return value
    }

    /***** {@link SerializableCatchEmpty} *****/
    static catchEmpty<T extends ValueOf<Serializable>>(
        fn: T,
        value: unknown
    ): null | ReturnType<T> {
        if (
            value === null ||
            typeof value === "undefined" ||
            (typeof value === "string" && value === "")
        )
            return null
        return fn(value) as ReturnType<T> // TODO: bind the this-context, so it does not need to be bound elsewhere
    }

    /***** {@link Exportable} *****/
    static export(value: unknown): string | void {
        // default export method
        // if (typeof value !== "string" || typeof value !== "number")
        //     throw new Error(`Could not export value: ${value}`)
        return value as string
    }
    static unexport(value: string): unknown {
        return value
    }

    /***** {@link ExposableInputComponent} *****/
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public ExposedInput: React.FC<ExposedInputProps<any, any>> = () => null

    /***** - rdg's components - *****/

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

    static unsafe_instantiateDummyCelll<T>(this: Ctor<T>): T {
        return new this(ColumnFactory.createDummy())
    }
}
