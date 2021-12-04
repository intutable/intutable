import React from "react"
import { CellType, CellData } from "./types"
import { CellComponents } from "@datagrid/Cell/CellComponents"
import type { CellComponent } from "./CellComponents/types"

const CellTypeComponentMap: {
    [key in CellType]: CellComponent
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

/**
 * Returns the adequate cell component for the given cell type.
 * @param {CellType} forType returns the cell component based on this type specification
 * @returns cell component
 */
const Cell: CellComponent = props => {
    const Component = CellTypeComponentMap[props.type]
    return <Component {...props} />
}

export default Cell
