import { ColumnInfo } from "@intutable/lazy-views/dist/types"
import ContentPasteIcon from "@mui/icons-material/ContentPaste"
import { ListItemIcon, ListItemText, MenuItem } from "@mui/material"
import { useSelectedRows } from "context/SelectedRowsContext"
import { checkPrimeSync } from "crypto"
import { useSnacki } from "hooks/useSnacki"
import { useTable } from "hooks/useTable"
import { useView } from "hooks/useView"
import React from "react"
import { HeaderRendererProps } from "react-data-grid"
import { Row } from "types"
import { columnToClipboard } from "utils/columnToClipboard"
import { isValidMailAddress } from "utils/isValidMailAddress"

export type ColumnToClipboardProps = {
    headerRendererProps: HeaderRendererProps<Row>
    colInfo: ColumnInfo
}

export const ColumnToClipboard: React.FC<ColumnToClipboardProps> = props => {
    const { headerRendererProps, colInfo: col } = props

    const { selectedRows } = useSelectedRows()

    const { data: viewData } = useView()
    const { snackInfo } = useSnacki()

    const handleCopyToClipboard = () => {
        const viewColInfo = viewData?.metaColumns.find(
            c => c.parentColumnId === col.id
        )
        if (viewColInfo == null) return

        // get values
        let values = viewData!.rows
            .map(row => row[viewColInfo!.key])
            .filter(e => e != null)

        // consider row selection
        if (
            headerRendererProps.allRowsSelected === false &&
            selectedRows.size > 0
        ) {
            values = data!.rows
                .map(row => {
                    if (
                        row[col!.key] != null &&
                        selectedRows.has(row.__rowIndex__)
                    )
                        return row
                })
                .filter(e => e != null)
        }

        // filter invalid emails
        if (col?.attributes.editor === "email")
            values = values?.filter(isValidMailAddress)

        columnToClipboard(values as (string | boolean | number)[])

        snackInfo("In die Zwischenablage kopiert!")
    }

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
