import { HiddenColumnsMenuItem } from "@datagrid/Toolbar/ToolbarItems/HiddenColumns/HiddenColumns"
import CheckIcon from "@mui/icons-material/Check"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import ShareIcon from "@mui/icons-material/Share"
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, MenuList } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { isViewIdOrigin, isViewNameOrigin } from "@shared/input-masks/utils"
import { useAPI } from "context"
import { useRowMask } from "context/RowMaskContext"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { useView } from "hooks/useView"
import React, { useState } from "react"

export type RowMaskContextMenuProps = {
    commentSectionOpen: boolean
    toggleCommentSection: () => void
    constraintSectionOpen: boolean
    toggleConstrainSection: () => void
}

export const RowMaskContextMenu: React.FC<RowMaskContextMenuProps> = props => {
    const theme = useTheme()
    const { snackError, snackSuccess } = useSnacki()
    const { deleteRow: _deleteRow } = useRow()
    const { data: view } = useView()
    const { row, inputMask } = useRowMask()
    const { project, table } = useAPI()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const openContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }
    const closeContextMenu = () => setAnchorEL(null)

    const deleteRow = async () => {
        if (!row || view == null) return
        const selectedRow = row
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
            if (!project || !table || !inputMask || !row || !view) throw new Error()
            // TODO: this might be not appropriate
            const viewParam =
                isViewIdOrigin(inputMask.origin) || isViewNameOrigin(inputMask.origin)
                    ? `&viewId=${view.descriptor.id}`
                    : ""
            const link =
                `${window.location.origin}/project/${project.id}/table/${table.id}?inputMask=${inputMask.id}&record=${row._id}` +
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
                    {inputMask == null && <HiddenColumnsMenuItem />}

                    {inputMask && inputMask.comments.length > 0 && (
                        <>
                            <MenuItem onClick={props.toggleCommentSection}>
                                {props.commentSectionOpen && (
                                    <ListItemIcon>
                                        <CheckIcon fontSize="small" />
                                    </ListItemIcon>
                                )}
                                <ListItemText>Kommentare</ListItemText>
                            </MenuItem>
                        </>
                    )}

                    {inputMask && (
                        <>
                            <MenuItem onClick={props.toggleConstrainSection}>
                                {props.constraintSectionOpen && (
                                    <ListItemIcon>
                                        <CheckIcon fontSize="small" />
                                    </ListItemIcon>
                                )}
                                <ListItemText>Constraints</ListItemText>
                            </MenuItem>
                        </>
                    )}

                    {inputMask && (
                        <MenuItem onClick={createShareLink}>
                            <ListItemIcon>
                                <ShareIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Permalink</ListItemText>
                        </MenuItem>
                    )}

                    {row && (
                        <MenuItem sx={{ color: theme.palette.warning.main }} onClick={deleteRow}>
                            <ListItemText>Eintrag Löschen</ListItemText>
                        </MenuItem>
                    )}
                </MenuList>
            </Menu>
        </>
    )
}
