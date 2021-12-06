import React, { useState } from "react"
import { Box, useTheme, Menu, MenuItem, Divider } from "@mui/material"
import { CellType } from "@datagrid/Cell/types"

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

    const handleOpenContextMenu = (event: any) => {
        event.preventDefault()
        setAnchorEL(event.currentTarget)
    }
    const handleCloseContextMenu = () => setAnchorEL(null)

    return (
        <>
            <Box onContextMenu={handleOpenContextMenu}>{props.label}</Box>
            {anchorEL && (
                <ColumnHeaderContextMenu
                    anchorEL={anchorEL}
                    open={anchorEL != null}
                    onClose={handleCloseContextMenu}
                >
                    <Box
                        // onClick={handleDeleteProject}
                        sx={{ color: theme.palette.warning.main }}
                    >
                        Change Type ({props.type})
                    </Box>
                </ColumnHeaderContextMenu>
            )}
        </>
    )
}
