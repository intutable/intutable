import React, { useState } from "react"
import {
    Box,
    useTheme,
    Menu,
    MenuItem,
    IconButton,
    Typography,
} from "@mui/material"
import {
    EditorType,
    isEditorType,
    RuntimeEditorMap,
} from "@app/components/DataGrid/Editor/editor-management"
import { ChangeCellTypeDialog } from "./ChangeCellTypeDialog"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { useProjectCtx } from "@app/context/ProjectContext"

type ColumnHeaderProps = {
    label: string
    type: EditorType
}

export const ColumnHeader: React.FC<ColumnHeaderProps> = props => {
    const theme = useTheme()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const [changeTypeModalOpen, setChangeTypeModalOpen] = useState(false)

    const { renameColumn } = useProjectCtx()

    const handleOpenContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }
    const handleCloseContextMenu = () => setAnchorEL(null)

    const handleOpenChangeTypeModal = () => setChangeTypeModalOpen(true)
    const handleCloseChangeTypeModal = (newType?: EditorType) => {
        // TODO: change type
        /**
         * Things to do:
         * 1. Check if the old type can be converted to the new type in general (e.g. a number can not be converted to a string)
         * 2. If yes, check for every cell if the value can be converted to the new type
         * 3. convert the values to the new type
         */
        if (newType) alert(`(not implemented) Neuer Typ: ${newType}`)
        setChangeTypeModalOpen(false)
        handleCloseContextMenu()
    }

    const handleRenameColumn = async () => {}

    return (
        <>
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    display: "inline-flex",
                    justifyContent: "flex-start",
                    alignContent: "center",
                    alignItems: "center",
                }}
            >
                <Typography
                    sx={{
                        fontWeight: "bold",
                        flex: 1,
                    }}
                >
                    {props.label}
                </Typography>
                <IconButton
                    onClick={handleOpenContextMenu}
                    sx={{
                        transform: "scale(0.6)",
                    }}
                >
                    <MoreVertIcon />
                </IconButton>
            </Box>
            {anchorEL && (
                <Menu
                    elevation={0}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    // transformOrigin={{ vertical: "top", horizontal: "right" }}
                    open={anchorEL != null}
                    anchorEl={anchorEL}
                    keepMounted={true}
                    onClose={handleCloseContextMenu}
                    PaperProps={{
                        sx: {
                            boxShadow: theme.shadows[1],
                        },
                    }}
                >
                    <MenuItem
                        onClick={handleOpenChangeTypeModal}
                        sx={{ color: theme.palette.warning.main }}
                    >
                        Typ ändern ({props.type})
                    </MenuItem>
                    <MenuItem onClick={handleRenameColumn}>Umbenennen</MenuItem>
                </Menu>
            )}
            <ChangeCellTypeDialog
                currentType={props.type}
                open={changeTypeModalOpen}
                onClose={handleCloseChangeTypeModal}
            />
        </>
    )
}
