import FileDownloadIcon from "@mui/icons-material/FileDownload"
import { Box, IconButton, Menu, MenuItem, useTheme } from "@mui/material"
import { useSnackbar } from "notistack"
import React, { useState } from "react"
import { FileFormat } from "./export"

type FileDownoadContextMenuProps = {
    anchorEL: Element
    open: boolean
    onClose: () => void
    children: Array<React.ReactNode> | React.ReactNode // overwrite implicit `children`
}
const FileDownloadContextMenu: React.FC<
    FileDownoadContextMenuProps
> = props => {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const triggerDownload = (content: unknown, filename: string) => {}

export type FileDownloadProps = {
    getData: () => Array<unknown>
}

/**
 * Button w/ options for exporting the data to several file formats
 */
const FileDownload: React.FC<FileDownloadProps> = () => {
    const { enqueueSnackbar } = useSnackbar()

    const [anchorEL, setAnchorEL] = useState<HTMLElement | null>(null)

    const handleOnClick = (event: {
        preventDefault: () => void
        currentTarget: React.SetStateAction<HTMLElement | null>
    }) => {
        event.preventDefault()
        setAnchorEL(event.currentTarget)
    }
    const handleCloseContextMenu = () => setAnchorEL(null)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleExport = async (fileFormat: FileFormat) => {
        // await exportTo(fileFormat, props.getData())
        enqueueSnackbar("This feature in not implemented yet!", {
            variant: "warning",
        })
        // triggerDownload()
        setAnchorEL(null)
    }

    return (
        <>
            <IconButton onClick={handleOnClick}>
                <FileDownloadIcon />
            </IconButton>
            {anchorEL && (
                <FileDownloadContextMenu
                    anchorEL={anchorEL}
                    open={anchorEL != null}
                    onClose={handleCloseContextMenu}
                >
                    <Box onClick={() => handleExport("CSV")}>CSV</Box>
                    <Box onClick={() => handleExport("PDF")}>PDF</Box>
                    <Box onClick={() => handleExport("XLSX")}>EXCEL</Box>
                </FileDownloadContextMenu>
            )}
        </>
    )
}
export default FileDownload
