import React, { useState } from "react"
import {
    Box,
    useTheme,
    Menu,
    MenuItem,
    IconButton,
    Typography,
} from "@mui/material"
import { CellType, isCellType, _RuntimeCellTypeMap } from "@datagrid/Cell/types"
import { ChangeCellTypeDialog } from "./ChangeCellTypeDialog"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { display } from "@mui/system"

type ColumnHeaderContextMenuProps = {
    anchorEL: Element
    open: boolean
    onClose: () => void
    children: Array<React.ReactNode> | React.ReactNode // overwrite implicit `children`
}

const ColumnHeaderContextMenu: React.FC<ColumnHeaderContextMenuProps> =
    props => {
        const theme = useTheme()

        return (
            <Menu
                elevation={0}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                // transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={props.open}
                anchorEl={props.anchorEL}
                keepMounted={true}
                onClose={props.onClose}
                PaperProps={{
                    sx: {
                        boxShadow: theme.shadows[1],
                    },
                }}
            >
                {Array.isArray(props.children) ? (
                    props.children.map((item, i) => (
                        <MenuItem key={i}>{item}</MenuItem>
                    ))
                ) : (
                    <MenuItem>{props.children}</MenuItem>
                )}
            </Menu>
        )
    }

type ColumnHeaderProps = {
    label: string
    type: CellType
}

export const ColumnHeader: React.FC<ColumnHeaderProps> = props => {
    const theme = useTheme()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const [changeTypeModalOpen, setChangeTypeModalOpen] = useState(false)

    const handleOpenContextMenu = (event: any) => {
        setAnchorEL(event.currentTarget)
    }
    const handleCloseContextMenu = () => setAnchorEL(null)

    const handleOpenChangeTypeModal = () => setChangeTypeModalOpen(true)
    const handleCloseChangeTypeModal = (newType?: CellType) => {
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
                <ColumnHeaderContextMenu
                    anchorEL={anchorEL}
                    open={anchorEL != null}
                    onClose={handleCloseContextMenu}
                >
                    <Box
                        onClick={handleOpenChangeTypeModal}
                        sx={{ color: theme.palette.warning.main }}
                    >
                        Change Cell Type ({props.type})
                    </Box>
                </ColumnHeaderContextMenu>
            )}
            <ChangeCellTypeDialog
                currentType={props.type}
                open={changeTypeModalOpen}
                onClose={handleCloseChangeTypeModal}
            />
        </>
    )
}
