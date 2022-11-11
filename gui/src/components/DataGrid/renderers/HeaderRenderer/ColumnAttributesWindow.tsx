import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    ListItemText,
    MenuItem,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useView } from "hooks/useView"
import React, { useMemo, useState } from "react"
import { HeaderRendererProps } from "react-data-grid"
import { Row } from "types"
import InfoIcon from "@mui/icons-material/Info"
import * as Property from "@datagrid/ColumnProperties"
import { ProxyColumn } from "utils/column utils/ColumnProxy"
import { Column } from "types"

type ModalProps = {
    open: boolean
    onClose: () => void
    headerRendererProps: HeaderRendererProps<Row>
}

const Modal: React.FC<ModalProps> = props => {
    const { open, onClose, headerRendererProps } = props

    const column = headerRendererProps.column as Column.Serialized

    return (
        <Dialog open={open} onClose={() => onClose()}>
            <DialogTitle>Eigenschaften</DialogTitle>
            <DialogContent>
                <Property.Name column={column} />
                <Property.ChangeCellType column={column} />
                <Property.Hidden column={column} />
                <Property.Editable column={column} />
                <Property.Sortable column={column} />
                <Property.Frozen column={column} />
                <Property.Resizable column={column} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose()}>Schließen</Button>
            </DialogActions>
        </Dialog>
    )
}

export type ColumnAttributesWindowProps = {
    headerRendererProps: HeaderRendererProps<Row>
    onCloseContextMenu: () => void
}

export const ColumnAttributesWindow: React.FC<
    ColumnAttributesWindowProps
> = props => {
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const openModal = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }
    const closeModal = () => {
        setAnchorEL(null)
        props.onCloseContextMenu()
    }

    return (
        <>
            <MenuItem onClick={openModal}>
                <ListItemText>Eigenschaften</ListItemText>
            </MenuItem>

            <Modal
                open={anchorEL != null}
                onClose={closeModal}
                headerRendererProps={props.headerRendererProps}
            />
        </>
    )
}
