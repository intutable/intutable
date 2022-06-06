import React, { useState } from "react"
import {
    Tooltip,
    Typography,
    ListItem,
    ListItemButton,
    ListItemText,
    IconButton,
    Menu,
    MenuItem,
    useTheme,
} from "@mui/material"
import Zoom from "@mui/material/Zoom"
import ClearIcon from "@mui/icons-material/Clear"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"

import { ViewDescriptor } from "@intutable/lazy-views/dist/types"

import { useAPI } from "context/APIContext"

export type ViewListItemProps = {
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
    onHandleRenameView: (view: ViewDescriptor, newName: string) => Promise<void>
    onHandleDeleteView: (view: ViewDescriptor) => Promise<void>
}

export const ViewListItem: React.FC<ViewListItemProps> = props => {
    const view: ViewDescriptor = props.view

    const { view: currentView } = useAPI()
    const theme = useTheme()

    const [anchorEl, setAnchorEl] = useState<Element | null>(null)

    const handleOpenContextMenu = (event: React.MouseEvent<HTMLLIElement>) => {
        event.preventDefault()
        setAnchorEl(event.currentTarget.children[0] as HTMLDivElement)
    }
    const handleCloseContextMenu = () => setAnchorEl(null)

    const handleRenameView = async () => {
        handleCloseContextMenu()
        const newName = prompt("Neuer Name:")
        if (!newName) return
        return props.onHandleRenameView(view, newName)
    }

    const handleDeleteViewButton = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        event.stopPropagation()
        const confirmed = confirm("Sicht wirklich löschen?")
        if (confirmed) return props.onHandleDeleteView(view)
    }

    return (
        <>
            <ListItem
                sx={{
                    p: 0,
                    mb: 1,
                    bgcolor:
                        view.id === currentView?.id
                            ? theme.palette.action.selected
                            : undefined,
                }}
                disablePadding
                onContextMenu={handleOpenContextMenu}
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
            <Menu
                elevation={0}
                open={anchorEl != null}
                anchorEl={anchorEl}
                keepMounted={true}
                onClose={handleCloseContextMenu}
                PaperProps={{
                    sx: {
                        boxShadow: theme.shadows[1],
                    },
                }}
            >
                <MenuItem onClick={handleRenameView}>Umbenennen</MenuItem>
            </Menu>
        </>
    )
}
