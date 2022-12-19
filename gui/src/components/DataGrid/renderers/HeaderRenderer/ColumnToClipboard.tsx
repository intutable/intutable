import { cellMap } from "@datagrid/Cells"
import ContentPasteIcon from "@mui/icons-material/ContentPaste"
import { ListItemIcon, ListItemText, MenuItem } from "@mui/material"
import { useSelectedRows } from "context/SelectedRowsContext"
import { useColumn } from "hooks/useColumn"
import { useSnacki } from "hooks/useSnacki"
import { useView } from "hooks/useView"
import React, { useCallback } from "react"
import { HeaderRendererProps } from "react-data-grid"
import { Row } from "types"

export type ColumnToClipboardProps = {
    headerRendererProps: HeaderRendererProps<Row>
}

export const ColumnToClipboard: React.FC<ColumnToClipboardProps> = props => {
    const { headerRendererProps } = props

    const { selectedRows } = useSelectedRows()

    const { data: viewData } = useView()
    const { snackInfo } = useSnacki()
    const { getColumnInfo } = useColumn()
    const columnInfo = getColumnInfo(props.headerRendererProps.column)

    const handleCopyToClipboard = useCallback(() => {
        if (columnInfo == null) return null
        const viewColInfo = viewData?.metaColumns.find(c => c.parentColumnId === columnInfo.id)
        if (viewColInfo == null) return

        // get values
        let values = viewData!.rows.map(row => row[viewColInfo!.key]).filter(e => e != null)

        // consider row selection
        if (headerRendererProps.allRowsSelected === false && selectedRows.size > 0) {
            values = viewData!.rows
                .map(row => {
                    const value = row[viewColInfo!.key]
                    if (selectedRows.has(row.index)) return value
                })
                .filter(e => e != null)
        }

        const cellCtor = cellMap.getCellCtor(props.headerRendererProps.column.cellType)

        values = values.filter(val => val != null && val !== "").map(val => cellCtor.export(val))

        navigator.clipboard.writeText(values.join(", "))

        snackInfo("In die Zwischenablage kopiert!")
    }, [
        columnInfo,
        viewData,
        headerRendererProps.allRowsSelected,
        selectedRows,
        props.headerRendererProps.column,
        snackInfo,
    ])

    return (
        <MenuItem onClick={handleCopyToClipboard}>
            <ListItemIcon>
                <ContentPasteIcon />
            </ListItemIcon>

            <ListItemText>
                {/* Note: when a row is selected and the email is invalid, it will still count the row */}
                {headerRendererProps.allRowsSelected || selectedRows.size === 0
                    ? "Alle Werte"
                    : selectedRows.size === 1
                    ? "Einen Wert"
                    : selectedRows.size + " Werte"}{" "}
                in die Zwischenablage kopieren
            </ListItemText>
        </MenuItem>
    )
}
