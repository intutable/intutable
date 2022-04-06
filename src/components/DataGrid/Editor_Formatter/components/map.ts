import { CellContentType } from "../type-management"
import { Editor } from "../types/Editor"
import { Formatter } from "../types/Formatter"
import * as EditorComponent from "./editors"
import * as FormatterComponent from "./formatters"

export const CellContentTypeComponents: {
    [key in CellContentType]: {
        formatter: Formatter
        editor: Editor
    }
} = {
    string: {
        editor: EditorComponent.StringEditor,
        formatter: FormatterComponent.DefaultFormatter,
    },
    number: {
        editor: EditorComponent.NumberEditor,
        formatter: FormatterComponent.DefaultFormatter,
    },
    percentage: {
        editor: EditorComponent.PercentageEditor,
        formatter: FormatterComponent.DefaultFormatter,
    },
    currency: {
        editor: EditorComponent.CurrencyEditor,
        formatter: FormatterComponent.DefaultFormatter,
    },
    boolean: {
        editor: EditorComponent.BooleanEditor,
        formatter: FormatterComponent.DefaultFormatter,
    },
    date: {
        editor: EditorComponent.DateEditor,
        formatter: FormatterComponent.DefaultFormatter,
    },
    datetime: {
        editor: EditorComponent.DateEditor,
        formatter: FormatterComponent.DefaultFormatter,
    },
    time: {
        editor: EditorComponent.DateEditor,
        formatter: FormatterComponent.DefaultFormatter,
    },
    avatar: {
        editor: EditorComponent.AvatarEditor,
        formatter: FormatterComponent.DefaultFormatter,
    },
    link: {
        editor: EditorComponent.LinkEditor,
        formatter: FormatterComponent.DefaultFormatter,
    },
    email: {
        editor: EditorComponent.EMailEditor,
        formatter: FormatterComponent.DefaultFormatter,
    },
    select: {
        editor: EditorComponent.SelectEditor,
        formatter: FormatterComponent.DefaultFormatter,
    },
    multiSelect: {
        editor: EditorComponent.SelectEditor,
        formatter: FormatterComponent.DefaultFormatter,
    },
    complex: {
        editor: EditorComponent.ComplexEditor,
        formatter: FormatterComponent.DefaultFormatter,
    },
}
