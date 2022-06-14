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
    standard: StandardFormatter,
    link: LinkColumnFormatter,
    lookup: StandardFormatter,
    // "index": ?
}

export const CellContentTypeComponents: {
    [key in CellContentType]: CellContentTypeComponentDescriptor
} = {
    string: { editor: Editor.StringEditor, formatter: StandardFormatter },
    number: { editor: Editor.NumberEditor, formatter: StandardFormatter },
    percentage: {
        editor: Editor.PercentageEditor,
        formatter: StandardFormatter,
    },
    currency: { editor: Editor.CurrencyEditor, formatter: StandardFormatter },
    boolean: { editor: null, formatter: BooleanFormatter },
    date: { editor: Editor.DateEditor, formatter: StandardFormatter },
    datetime: { editor: Editor.DateEditor, formatter: StandardFormatter },
    time: { editor: Editor.DateEditor, formatter: StandardFormatter },
    avatar: { editor: Editor.AvatarEditor, formatter: StandardFormatter },
    hyperlink: { editor: Editor.HyperlinkEditor, formatter: StandardFormatter },
    email: { editor: Editor.EMailEditor, formatter: EMailFormatter },
    select: { editor: Editor.SelectEditor, formatter: StandardFormatter },
    multiSelect: { editor: Editor.SelectEditor, formatter: StandardFormatter },
    complex: { editor: Editor.ComplexEditor, formatter: StandardFormatter },
}
