import { Row } from "@app/types/types"
import React from "react"
import { EditorProps } from "react-data-grid"
import { EditorType } from "../editor-management/editorTypes"
import { AvatarEditor as _AvatarEditor } from "./AvatarEditor"
import { BooleanEditor as _BooleanEditor } from "./BooleanEditor"
import { ComplexEditor as _ComplexEditor } from "./ComplexEditor"
import { CurrencyEditor as _CurrencyEditor } from "./CurrencyEditor"
import { DateEditor as _DateEditor } from "./DateEditor"
import { EMailEditor as _EMailEditor } from "./EMailEditor"
import { LinkEditor as _LinkEditor } from "./LinkEditor"
import { NumberEditor as _NumberEditor } from "./NumberEditor"
import { PercentageEditor as _PercentageEditor } from "./PercentageEditor"
import { SelectEditor as _SelectEditor } from "./SelectEditor"
import { StringEditor as _StringEditor } from "./StringEditor"

export namespace EditorComponents {
    export const StringEditor = _StringEditor
    export const NumberEditor = _NumberEditor
    export const PercentageEditor = _PercentageEditor
    export const CurrencyEditor = _CurrencyEditor
    export const BooleanEditor = _BooleanEditor
    export const DateEditor = _DateEditor
    export const AvatarEditor = _AvatarEditor
    export const LinkEditor = _LinkEditor
    export const EMailEditor = _EMailEditor
    export const SelectEditor = _SelectEditor
    export const ComplexEditor = _ComplexEditor
}

const EditorComponentMap: {
    [key in EditorType]: Editor
} = {
    string: EditorComponents.StringEditor,
    number: EditorComponents.NumberEditor,
    percentage: EditorComponents.PercentageEditor,
    currency: EditorComponents.CurrencyEditor,
    boolean: EditorComponents.BooleanEditor,
    date: EditorComponents.DateEditor,
    datetime: EditorComponents.DateEditor,
    time: EditorComponents.DateEditor,
    avatar: EditorComponents.AvatarEditor,
    link: EditorComponents.LinkEditor,
    email: EditorComponents.EMailEditor,
    select: EditorComponents.SelectEditor,
    multiSelect: EditorComponents.SelectEditor,
    complex: EditorComponents.ComplexEditor,
}

export type Editor = React.ComponentType<EditorProps<Row>>

export const getEditor = (type: EditorType): Editor => EditorComponentMap[type]
