import type { PredefinedToolbarItem } from "../types"
import { IconButton, useTheme } from "@mui/material"
import FileDownloadIcon from "@mui/icons-material/FileDownload"

type FileDownloadProps = {}

/**
 * Button w/ options for exporting the data to several file formats
 */
const FileDownload: PredefinedToolbarItem<FileDownloadProps> = props => {
    const theme = useTheme()

    const handleOnClick = () => {}

    return (
        <IconButton onClick={handleOnClick}>
            <FileDownloadIcon />
        </IconButton>
    )
}
export default FileDownload
