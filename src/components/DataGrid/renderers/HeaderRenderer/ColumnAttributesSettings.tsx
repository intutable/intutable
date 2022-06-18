import { ColumnInfo, ViewDescriptor } from "@intutable/lazy-views/dist/types"
import LoadingButton from "@mui/lab/LoadingButton"
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItemText,
    MenuItem,
    Stack,
    Typography,
    useTheme,
} from "@mui/material"
import { useSnacki } from "hooks/useSnacki"
import { useView } from "hooks/useView"
import React, { useState, useMemo } from "react"
import { HeaderRendererProps } from "react-data-grid"
import { Row, ViewData } from "types"

type ModalProps = {
    open: boolean
    onClose: () => void
    headerRendererProps: HeaderRendererProps<Row>
}

const Modal: React.FC<ModalProps> = props => {
    const { open, onClose, headerRendererProps } = props
    const theme = useTheme()

    const { data: view } = useView()
    const column = useMemo(
        () =>
            view
                ? (view.columns.find(
                      c => c._id! === headerRendererProps.column._id
                  ) as unknown as ViewData.Serialized)
                : null,
        [headerRendererProps.column._id, view]
    )

    if (column == null) return null

    console.log(column)

    return (
        <Dialog open={open} onClose={() => onClose()}>
            <DialogTitle>Spalten-Eigenschaften</DialogTitle>
            <DialogContent>
                <Stack
                    sx={{
                        overflow: "scroll",
                        pl: 1,
                        pt: 1,
                    }}
                >
                    {Object.entries(column).map(([key, value], i) => (
                        <Stack key={i}>
                            <Typography variant="body1" sx={{ mt: 1.5 }}>
                                {value as string}
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
                                {key}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose()}>Schließen</Button>
            </DialogActions>
        </Dialog>
    )
}

export type ColumnAttributesSettingsProps = {
    headerRendererProps: HeaderRendererProps<Row>
    onCloseContextMenu: () => void
}

export const ColumnAttributesSettings: React.FC<
    ColumnAttributesSettingsProps
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
