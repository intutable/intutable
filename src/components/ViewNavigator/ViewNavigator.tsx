import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Tooltip,
    Typography,
    useTheme,
    IconButton,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    TextField,
    Button,
} from "@mui/material"
import ClearIcon from "@mui/icons-material/Clear"
import React, { useState } from "react"
import Zoom from "@mui/material/Zoom"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import AddBoxIcon from "@mui/icons-material/AddBox"
import { ViewDescriptor } from "@intutable/lazy-views/dist/types"

import { useSnacki } from "hooks/useSnacki"
import { useAPI } from "context/APIContext"
import { useTable } from "hooks/useTable"
import { useViews } from "hooks/useViews"

type ViewListItemProps = {
    view: ViewDescriptor
    key: number
    /**
     * only when `children` is not a string
     */
    title?: string
    /**
     * default {@link ChevronRightIcon}
     */
    icon?: React.ReactNode
    onHandleSelectView: (view: ViewDescriptor) => Promise<void>
    onHandleDeleteView: (view: ViewDescriptor) => Promise<void>
}

const ViewListItem: React.FC<ViewListItemProps> = props => {
    const view: ViewDescriptor = props.view
    const { view: currentView } = useAPI()
    const theme = useTheme()

    const handleDeleteViewButton = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        event.stopPropagation()
        const confirmed = confirm("Sicht wirklich löschen?")
        if (confirmed) return props.onHandleDeleteView(view)
    }
    return (
        <ListItem
            key={props.key}
            sx={{
                p: 0,
                mb: 1,
                bgcolor:
                    view.id === currentView?.id
                        ? theme.palette.action.selected
                        : undefined,
            }}
            disablePadding
        >
            <Tooltip
                title={`Sicht ${view.name} anzeigen`}
                arrow
                TransitionComponent={Zoom}
                enterDelay={500}
                placement="right"
            >
                <Typography
                    variant="subtitle2"
                    onClick={() => {}}
                    sx={{
                        cursor: "pointer",
                        width: "100%",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    <ListItemButton
                        onClick={() => props.onHandleSelectView(view)}
                    >
                        {props.icon || <ChevronRightIcon />}
                        <ListItemText primary={view.name}></ListItemText>
                        <IconButton
                            size={"small"}
                            onClick={handleDeleteViewButton}
                        >
                            <ClearIcon />
                        </IconButton>
                    </ListItemButton>
                </Typography>
            </Tooltip>
        </ListItem>
    )
}

type AddViewModalProps = {
    open: boolean
    onClose: () => void
    onHandleCreateView: (name: string) => Promise<void>
}

const AddViewModal: React.FC<AddViewModalProps> = props => {
    const [name, setName] = useState<string>("")

    return (
        <Dialog open={props.open} onClose={() => props.onClose()}>
            <DialogTitle>Neue Sicht erstellen</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    {/* Name */}
                    <TextField
                        label="Name"
                        variant="outlined"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose()}>Abbrechen</Button>
                <Button
                    onClick={async () => {
                        await props.onHandleCreateView(name)
                        props.onClose()
                    }}
                    disabled={name === ""}
                >
                    Erstellen
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export type ViewNavigatorProps = {
    open: boolean
}
export const ViewNavigator: React.FC<ViewNavigatorProps> = props => {
    const theme = useTheme()

    const { view: currentView, setView } = useAPI()
    const { data } = useTable()
    const { views, createView, deleteView, mutate } = useViews(
        data?.metadata.descriptor
    )
    const { snackInfo } = useSnacki()

    // anchor for "create view" modal
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)

    if (props.open === false) return null

    const handleCreateView = async (name: string): Promise<void> => {
        await createView(name)
        mutate()
    }
    const handleSelectView = async (view: ViewDescriptor): Promise<void> => {
        if (currentView?.id === view.id) return
        else setView(view)
    }
    const handleDeleteView = async (view: ViewDescriptor): Promise<void> => {
        if (views.length === 1) {
            snackInfo("Kann einzige Sicht nicht löschen")
            return
        }
        await deleteView(view.id)
        mutate()
    }

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                border: "1px solid",
                borderColor: theme.palette.divider,
                borderRadius: "4px",
                overflow: "hidden",
                p: theme.spacing(1),
            }}
        >
            <Typography
                variant="overline"
                sx={{
                    letterSpacing: 1,
                    display: "flex",
                    alignContent: "center",
                    justifyContent: "center",
                    width: "100%",
                    textAlign: "center",
                }}
            >
                Views
            </Typography>
            <Divider />
            <List
                sx={{
                    overflowY: "scroll",
                }}
            >
                {views &&
                    views.map(view => (
                        <ViewListItem
                            key={view.id}
                            view={view}
                            onHandleSelectView={handleSelectView}
                            onHandleDeleteView={handleDeleteView}
                        />
                    ))}
            </List>
            <Tooltip
                title={"Neue Sicht anlegen"}
                arrow
                TransitionComponent={Zoom}
                enterDelay={500}
                placement="right"
            >
                <IconButton
                    size="medium"
                    onClick={e => setAnchorEL(e.currentTarget)}
                >
                    <AddBoxIcon />
                </IconButton>
            </Tooltip>
            <AddViewModal
                open={anchorEL != null}
                onClose={() => setAnchorEL(null)}
                onHandleCreateView={handleCreateView}
            />
        </Box>
    )
}
