import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, MenuList } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useRowMask } from "context/RowMaskContext"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import React, { useState } from "react"
import { HiddenColumnsMenuItem } from "@datagrid/Toolbar/ToolbarItems/HiddenColumns/HiddenColumns"
import CheckIcon from "@mui/icons-material/Check"
import { useView } from "hooks/useView"
import { useInputMask } from "hooks/useInputMask"
import ShareIcon from "@mui/icons-material/Share"
import { useAPI } from "context"
import { isViewIdOrigin, isViewNameOrigin } from "@shared/input-masks/utils"
export type RowMaskContextMenuProps = {
    commentsVisible: boolean
    toggleCommentsVisible: () => void
}

export const RowMaskContextMenu: React.FC<RowMaskContextMenuProps> = props => {
    const theme = useTheme()
    const { snackError, snackSuccess } = useSnacki()
    const { deleteRow: _deleteRow } = useRow()
    const { data: view } = useView()
    const { rowMaskState, setRowMaskState, appliedInputMask: selectedInputMask } = useRowMask()
    const { currentInputMask } = useInputMask()
    const { project, table } = useAPI()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const openContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }
    const closeContextMenu = () => setAnchorEL(null)

    const deleteRow = async () => {
        if (rowMaskState.mode !== "edit" || view == null) return
        const selectedRow = view.rows.find(row => row._id === rowMaskState.row._id)
        if (selectedRow == null) return
        try {
            await _deleteRow(selectedRow)
        } catch (error) {
            snackError("Der Eintrag konnte nicht gelöscht werden.")
        } finally {
            closeContextMenu()
        }
    }

    const createShareLink = () => {
        try {
            if (!project || !table || !currentInputMask || rowMaskState.mode === "closed" || !view)
                throw new Error()
            // TODO: this might be not appropriate
            const viewParam =
                isViewIdOrigin(currentInputMask.origin) || isViewNameOrigin(currentInputMask.origin)
                    ? `&viewId=${view.descriptor.id}`
                    : ""
            const link =
                `${window.location.origin}/project/${project.id}/table/${table.id}?inputMask=${currentInputMask.id}&record=${rowMaskState.row._id}` +
                viewParam
            navigator.clipboard.writeText(link)
            snackSuccess("Link in die Zwischenablage kopiert!")
        } catch (error) {
            snackError("Es konnte kein Link zum Teilen erstellt werden!")
        } finally {
            closeContextMenu()
        }
    }

    return (
        <>
            <IconButton size="small" onClick={openContextMenu}>
                <MoreHorizIcon fontSize="small" />
            </IconButton>
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
                <MenuList>
                    {selectedInputMask == null && <HiddenColumnsMenuItem />}

                    {selectedInputMask != null &&
                        currentInputMask &&
                        currentInputMask.comments.length > 0 && (
                            <>
                                <MenuItem onClick={props.toggleCommentsVisible}>
                                    {props.commentsVisible && (
                                        <ListItemIcon>
                                            <CheckIcon fontSize="small" />
                                        </ListItemIcon>
                                    )}
                                    <ListItemText>Kommentare</ListItemText>
                                </MenuItem>
                            </>
                        )}
                    {selectedInputMask != null && (
                        <MenuItem onClick={createShareLink}>
                            <ListItemIcon>
                                <ShareIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Permalink</ListItemText>
                        </MenuItem>
                    )}

                    {rowMaskState.mode === "edit" && (
                        <MenuItem sx={{ color: theme.palette.warning.main }} onClick={deleteRow}>
                            <ListItemText>Eintrag Löschen</ListItemText>
                        </MenuItem>
                    )}
                </MenuList>
            </Menu>
        </>
    )
}
