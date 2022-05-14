import { CellContentType } from "../type-management"
import { EditorComponent } from "../types/EditorComponent"
import * as Editor from "./editors"

export const CellContentTypeComponents: {
    [key in CellContentType]: EditorComponent
} = {
    string: Editor.StringEditor,
    number: Editor.NumberEditor,
    percentage: Editor.PercentageEditor,
    currency: Editor.CurrencyEditor,
    boolean: Editor.BooleanEditor,
    date: Editor.DateEditor,
    datetime: Editor.DateEditor,
    time: Editor.DateEditor,
    avatar: Editor.AvatarEditor,
    link: Editor.LinkEditor,
    email: Editor.EMailEditor,
    select: Editor.SelectEditor,
    multiSelect: Editor.SelectEditor,
    complex: Editor.ComplexEditor,
}
