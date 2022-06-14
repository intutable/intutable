import { CellContentType } from "@datagrid/Editor/type-management"
import { EditorComponent } from "@datagrid/Editor/types/EditorComponent"
import { FormatterComponent } from "@datagrid/Formatter"
import { BooleanFormatter } from "@datagrid/Formatter/formatters/BooleanFormatter"
import { EMailFormatter } from "@datagrid/Formatter/formatters/EMailFormatter"
import { LinkColumnFormatter } from "@datagrid/Formatter/formatters/LinkColumnFormatter"
import { StandardFormatter } from "@datagrid/Formatter/formatters/StandardFormatter"
import { MetaColumnProps } from "types"
import * as Editor from "@datagrid/Editor/components/editors"

export type CellContentTypeComponentDescriptor = {
    editor: EditorComponent | null | undefined
    formatter: FormatterComponent
}

export const ColumnKindComponents: {
    [key in MetaColumnProps["_kind"]]: FormatterComponent
} = {
    /**
     * Default, won't be used directly from this object.
     * But from {@link CellContentTypeComponents}.
     * @legacy
     */
    standard: StandardFormatter,
    link: LinkColumnFormatter,
    lookup: StandardFormatter,
    // "index": ?
}

export const CellContentTypeComponents: {
    [key in CellContentType]: CellContentTypeComponentDescriptor
} = {
    string: {
        editor: Editor.StringEditor,
        formatter: ColumnKindComponents.standard,
    },
    number: {
        editor: Editor.NumberEditor,
        formatter: ColumnKindComponents.standard,
    },
    percentage: {
        editor: Editor.PercentageEditor,
        formatter: ColumnKindComponents.standard,
    },
    currency: {
        editor: Editor.CurrencyEditor,
        formatter: ColumnKindComponents.standard,
    },
    boolean: { editor: null, formatter: BooleanFormatter },
    date: {
        editor: Editor.DateEditor,
        formatter: ColumnKindComponents.standard,
    },
    datetime: {
        editor: Editor.DateEditor,
        formatter: ColumnKindComponents.standard,
    },
    time: {
        editor: Editor.DateEditor,
        formatter: ColumnKindComponents.standard,
    },
    avatar: {
        editor: Editor.AvatarEditor,
        formatter: ColumnKindComponents.standard,
    },
    hyperlink: {
        editor: Editor.StringEditor,
        formatter: ColumnKindComponents.standard,
    },
    email: { editor: Editor.StringEditor, formatter: EMailFormatter },
    select: {
        editor: Editor.SelectEditor,
        formatter: ColumnKindComponents.standard,
    },
    multiSelect: {
        editor: Editor.SelectEditor,
        formatter: ColumnKindComponents.standard,
    },
    complex: {
        editor: Editor.ComplexEditor,
        formatter: ColumnKindComponents.standard,
    },
}
