import React from "react"
import { CellType, CellData } from "./types"

type CellProps = {
    type: CellType
    data: CellData<CellType>
}

const Cell: React.FC<CellProps> = props => {
    console.log(props)
    return null
}

export default Cell
