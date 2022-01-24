import React from "react"
import {
    CellAccess,
    CellContentPosition,
    CellData,
    CellType,
} from "../celltype-management/celltypes"
import type { Column, EditorProps } from "react-data-grid"
import { Row } from "@app/api/types"

export type CellComponentProps = {
    type: CellType
    access: CellAccess
    position: CellContentPosition
    editorProps: EditorProps<Row>
}

export type CellComponent = React.FC<CellComponentProps>
