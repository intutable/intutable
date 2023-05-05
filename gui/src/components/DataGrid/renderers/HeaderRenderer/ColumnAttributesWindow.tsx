import * as Property from "@datagrid/ColumnProperties"
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    ListItemText,
    MenuItem,
} from "@mui/material"
import { useLockedColumns } from "context/LockedColumnsContext"
import { useColumn } from "hooks/useColumn"
import { useView } from "hooks/useView"
import React, { useState } from "react"
import { HeaderRendererProps } from "react-data-grid"
import { Column, Row } from "types"

type ColumnAttributesWindowProps = {
    open: boolean
    onClose: () => void
    column: Column.Serialized
}

export const ColumnAttributesWindow: React.FC<ColumnAttributesWindowProps> = props => {
    const { open, onClose, column } = props

    const { data: view } = useView()
    const original = view?.columns.find(c => c.id === column.id)
    if (!original) return <>Fehler</>
    // fixes a bug
    const nonLockedColumn: Column.Serialized = {
        ...column,
        resizable: original.resizable,
    }

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
                <Property.Resizable column={nonLockedColumn} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose()}>Schließen</Button>
            </DialogActions>
        </Dialog>
    )
}

export type ColumnAttributesWindowButtonProps = {
    headerRendererProps: HeaderRendererProps<Row>
    onCloseContextMenu: () => void
}

export const ColumnAttributesWindowButton: React.FC<ColumnAttributesWindowButtonProps> = props => {
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

            <ColumnAttributesWindow
                open={anchorEL != null}
                onClose={closeModal}
                column={props.headerRendererProps.column as Column.Serialized}
            />
        </>
    )
}
