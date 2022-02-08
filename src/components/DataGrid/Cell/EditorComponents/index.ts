import { Row } from "@app/api"
import React from "react"
import { EditorProps } from "react-data-grid"
import { CellType } from "../celltype-management/celltypes"
import { AvatarCell as _AvatarCell } from "./AvatarCell"
import { BooleanCell as _BooleanCell } from "./BooleanCell"
import { ComplexCell as _ComplexCell } from "./ComplexCell"
import { CurrencyCell as _CurrencyCell } from "./CurrencyCell"
import { DateCell as _DateCell } from "./DateCell"
import { EMailCell as _EMailCell } from "./EMailCell"
import { LinkCell as _LinkCell } from "./LinkCell"
import { NumberCell as _NumberCell } from "./NumberCell"
import { PercentageCell as _PercentageCell } from "./PercentageCell"
import { SelectCell as _SelectCell } from "./SelectCell"
import { StringEditor as _StringCell } from "./StringCell"

export namespace CellComponents {
    export const StringCell = _StringCell
    export const NumberCell = _NumberCell
    export const PercentageCell = _PercentageCell
    export const CurrencyCell = _CurrencyCell
    export const BooleanCell = _BooleanCell
    export const DateCell = _DateCell
    export const AvatarCell = _AvatarCell
    export const LinkCell = _LinkCell
    export const EMailCell = _EMailCell
    export const SelectCell = _SelectCell
    export const ComplexCell = _ComplexCell
}

const CellTypeEditorMap: {
    [key in CellType]: Editor
} = {
    string: CellComponents.StringCell,
    number: CellComponents.NumberCell,
    percentage: CellComponents.PercentageCell,
    currency: CellComponents.CurrencyCell,
    boolean: CellComponents.BooleanCell,
    date: CellComponents.DateCell,
    datetime: CellComponents.DateCell,
    time: CellComponents.DateCell,
    avatar: CellComponents.AvatarCell,
    link: CellComponents.LinkCell,
    email: CellComponents.EMailCell,
    select: CellComponents.SelectCell,
    multiSelect: CellComponents.SelectCell,
    complex: CellComponents.ComplexCell,
}

export type Editor = React.ComponentType<EditorProps<Row>>

export const getEditor = (type: CellType): Editor => CellTypeEditorMap[type]
