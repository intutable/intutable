import type { PredefinedToolbarItem } from "../types"
import { IconButton, useTheme, Menu, MenuItem } from "@mui/material"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import React, { useState } from "react"

type FileDownoadContextMenuProps = {
    anchorEL: Element
    open: boolean
    onClose: () => void
    children: Array<React.ReactNode> | React.ReactNode // overwrite implicit `children`
}
const FileDownloadContextMenu: React.FC<FileDownoadContextMenuProps> = props => {
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
                props.children.map((item, i) => <MenuItem key={i}>{item}</MenuItem>)
            ) : (
                <MenuItem>{props.children}</MenuItem>
            )}
        </Menu>
    )
}

type FileDownloadProps = {}

/**
 * Button w/ options for exporting the data to several file formats
 */
const FileDownload: PredefinedToolbarItem<FileDownloadProps> = props => {
    const theme = useTheme()

    const [anchorEL, setAnchorEL] = useState<HTMLElement | null>(null)

    const handleOnClick = event => {
        event.preventDefault()
        setAnchorEL(event.currentTarget)
    }
    const handleCloseContextMenu = () => setAnchorEL(null)

    return (
        <>
            <IconButton onClick={handleOnClick}>
                <FileDownloadIcon />
            </IconButton>
            <FileDownloadContextMenu
                anchorEL={anchorEL}
                open={anchorEL != null}
                onClose={handleCloseContextMenu}
            >
                Test
            </FileDownloadContextMenu>
        </>
    )
}
export default FileDownload
