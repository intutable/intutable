import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import { ListItemText, Menu, MenuItem } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useRowMask } from "context/RowMaskContext"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import React, { useState } from "react"
import { HiddenColumnsMenuItem } from "@datagrid/Toolbar/ToolbarItems/HiddenColumns/HiddenColumns"

export const RowMaskContextMenu: React.FC = () => {
    const theme = useTheme()
    const { snackError } = useSnacki()
    const { deleteRow: _deleteRow } = useRow()
    const { rowMaskState, setRowMaskState } = useRowMask()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const openContextMenu = (e: React.MouseEvent<SVGSVGElement>) => {
        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }
    const closeContextMenu = () => setAnchorEL(null)

    const createRow = async () =>
        setRowMaskState({
            mode: "create",
        })

    const deleteRow = async () => {
        if (rowMaskState.mode !== "edit") return
        try {
            await _deleteRow(rowMaskState.row)
        } catch (error) {
            snackError("Der Eintrag konnte nicht gelöscht werden.")
        }
    }

    return (
        <>
            <MoreHorizIcon
                fontSize="small"
                sx={{ cursor: "pointer" }}
                onClick={openContextMenu}
            />
            <Menu
                elevation={0}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                open={anchorEL != null}
                anchorEl={anchorEL}
                onClose={closeContextMenu}
                PaperProps={{
                    sx: {
                        boxShadow: theme.shadows[1],
                    },
                }}
            >
                <HiddenColumnsMenuItem />
                {rowMaskState.mode === "edit" ? (
                    <>
                        <MenuItem onClick={createRow}>
                            <ListItemText>Neuer Eintrag</ListItemText>
                        </MenuItem>
                        <MenuItem
                            sx={{ color: theme.palette.warning.main }}
                            onClick={deleteRow}
                        >
                            <ListItemText>Eintrag Löschen</ListItemText>
                        </MenuItem>
                    </>
                ) : (
                    <MenuItem>
                        <ListItemText>Platzhalter für Erstellen</ListItemText>
                    </MenuItem>
                )}
            </Menu>
        </>
    )
}
