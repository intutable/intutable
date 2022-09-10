import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    ListItemText,
    MenuItem,
    Stack,
    Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useView } from "hooks/useView"
import React, { useMemo, useState } from "react"
import { HeaderRendererProps } from "react-data-grid"
import { Column, Row } from "types"

type AttributeProps = {
    label: string
    value: string
}

const Attribute: React.FC<AttributeProps> = props => {
    const theme = useTheme()
    const { label, value } = props
    return (
        <Stack>
            <Typography variant="body1" sx={{ mt: 1.5 }}>
                {value}
            </Typography>
            <Typography
                variant="caption"
                sx={{
                    mt: -0.5,
                    fontStyle: "italic",
                    color: theme.palette.grey[700],
                    fontSize: "60%",
                }}
            >
                {label}
            </Typography>
        </Stack>
    )
}

type ModalProps = {
    open: boolean
    onClose: () => void
    headerRendererProps: HeaderRendererProps<Row>
}

const Modal: React.FC<ModalProps> = props => {
    const { open, onClose, headerRendererProps } = props

    const { data: view } = useView()
    const column = useMemo(
        () =>
            view
                ? (view.columns.find(
                      c => c._id! === headerRendererProps.column._id
                  ) as unknown as Column)
                : null,
        [headerRendererProps.column._id, view]
    )

    if (column == null) return null

    return (
        <Dialog open={open} onClose={() => onClose()}>
            <DialogTitle>Spalten-Eigenschaften</DialogTitle>
            <DialogContent>
                <Attribute label={"Name"} value={column.name as string} />
                <Attribute
                    label={"Spalten-Typ"}
                    value={column._kind as string}
                />
                <Attribute
                    label={"Zellen-Typ"}
                    value={column._cellContentType as string}
                />
                <Attribute
                    label={"Editierbar"}
                    value={column.editable ? "Ja" : "Nein"}
                />
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
