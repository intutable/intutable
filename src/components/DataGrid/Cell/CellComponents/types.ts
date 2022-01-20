import React from "react"
import {
    CellAccess,
    CellContentPosition,
    CellData,
    CellType,
} from "../celltype-management/celltypes"
import type { Column, EditorProps } from "react-data-grid"

export type CellComponentProps = {
    type: CellType
    data: CellData<CellType>
    access: CellAccess
    position: CellContentPosition
    editorProps: EditorProps<any>
}

export type CellComponent = React.FC<CellComponentProps>
