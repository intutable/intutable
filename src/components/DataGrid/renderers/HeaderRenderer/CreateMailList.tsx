import { ColumnInfo } from "@intutable/lazy-views/dist/types"
import DownloadingIcon from "@mui/icons-material/Downloading"
import { ListItemIcon, ListItemText, MenuItem } from "@mui/material"
import React, { useState } from "react"
import { HeaderRendererProps } from "react-data-grid"
import { Row } from "types"
import { GenerateMailListDialog } from "./GenerateMailListDialog"

export type CreateMailListProps = {
    colInfo: ColumnInfo
    headerRendererProps: HeaderRendererProps<Row>
}

export const CreateMailList: React.FC<CreateMailListProps> = props => {
    const { colInfo: col } = props

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)

    const openModal = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }

    const closeModal = () => setAnchorEL(null)

    if (
        (col &&
            Object.prototype.hasOwnProperty.call(col, "attributes") &&
            col.attributes.editor === "email") === false
    )
        return null

    return (
        <>
            <MenuItem onClick={openModal}>
                <ListItemIcon>
                    <DownloadingIcon />
                </ListItemIcon>
                <ListItemText>Mailing-Liste generieren</ListItemText>
            </MenuItem>
            <GenerateMailListDialog
                open={anchorEL != null}
                onClose={closeModal}
                headerRendererProps={props.headerRendererProps}
            />
        </>
    )
}
