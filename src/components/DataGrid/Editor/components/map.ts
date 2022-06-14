import { CellContentType } from "../type-management"
import { EditorComponent } from "../types/EditorComponent"
import * as Editor from "./editors"

export const CellContentTypeComponents: {
    [key in CellContentType]: EditorComponent | null | undefined
} = {
    string: Editor.StringEditor,
    number: Editor.NumberEditor,
    percentage: Editor.PercentageEditor,
    currency: Editor.CurrencyEditor,
    boolean: Editor.StringEditor, // TODO: delete this editor as it is not used, only the formatter
    date: Editor.DateEditor,
    datetime: Editor.DateEditor,
    time: Editor.DateEditor,
    avatar: Editor.AvatarEditor,
    hyperlink: Editor.StringEditor,
    email: Editor.StringEditor,
    select: Editor.SelectEditor,
    multiSelect: Editor.SelectEditor,
    complex: Editor.ComplexEditor,
}
