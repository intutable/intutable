import { CellContentType } from "@datagrid/CellContentType/type_converter"
import { EditorComponent } from "@datagrid/CellContentType/types/EditorComponent"
import { FormatterComponent } from "@datagrid/CellContentType/types/FormatterComponent"
import { MetaColumnProps } from "types"
import * as Editor from "@datagrid/CellContentType/editors"
import * as Formatter from "@datagrid/CellContentType/formatters"
import * as Validator from "@datagrid/CellContentType/validators"

export type CellContentTypeComponentDescriptor = {
    editor: EditorComponent | null | undefined
    formatter: FormatterComponent
    validator?: (value: unknown) => boolean
}

export const ColumnKindComponents: {
    [key in MetaColumnProps["_kind"]]: FormatterComponent
} = {
    /**
     * Default, won't be used directly from this object.
     * But from {@link CellContentTypeComponents}.
     * @legacy
     */
    standard: Formatter.Standard,
    link: Formatter.LinkColumn,
    lookup: Formatter.Standard,
    index: Formatter.Standard,
}

export const CellContentTypeComponents: {
    [key in CellContentType]: CellContentTypeComponentDescriptor
} = {
    string: {
        editor: Editor.String,
        formatter: ColumnKindComponents.standard,
    },
    number: {
        editor: Editor.Number,
        formatter: Formatter.Number,
    },
    percentage: {
        editor: Editor.Percentage,
        formatter: Formatter.Percentage,
    },
    currency: {
        editor: Editor.Currency,
        formatter: Formatter.Currency,
    },
    boolean: { editor: null, formatter: Formatter.Boolean },
    date: {
        editor: null,
        formatter: Formatter.Date,
    },
    datetime: {
        editor: null,
        formatter: Formatter.Standard,
    },
    time: {
        editor: null,
        formatter: Formatter.Time,
    },
    avatar: {
        editor: Editor.Avatar,
        formatter: Formatter.Standard,
    },
    hyperlink: {
        editor: Editor.String,
        formatter: Formatter.Hyperlink,
        validator: Validator.Hyperlink,
    },
    email: {
        editor: Editor.String,
        formatter: Formatter.EMail,
        validator: Validator.EMail,
    },
    select: {
        editor: Editor.Select,
        formatter: Formatter.Standard,
    },
    multiSelect: {
        editor: Editor.Select,
        formatter: Formatter.Standard,
    },
    complex: {
        editor: Editor.Complex,
        formatter: Formatter.Standard,
    },
}
