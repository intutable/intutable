import React from "react"
import { CellAccess, CellContentPosition, CellData, CellType } from "../types"

export type CellComponentProps = {
    type: CellType
    data: CellData<CellType>
    access: CellAccess
    position: CellContentPosition
}

export type CellComponent = React.FC<CellComponentProps>
