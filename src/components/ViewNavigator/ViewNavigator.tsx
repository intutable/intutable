import {
    Box,
    List,
    ListItem,
    Tooltip,
    Typography,
    useTheme,
    IconButton,
    Divider,
} from "@mui/material"
import React from "react"
import Zoom from "@mui/material/Zoom"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import AddBoxIcon from "@mui/icons-material/AddBox"
import { ViewDescriptor } from "@intutable/lazy-views/dist/types"

import { useTable } from "hooks/useTable"
import { useViews } from "hooks/useViews"


type ViewListItemProps = {
    view: ViewDescriptor
    /**
     * only when `children` is not a string
     */
    title?: string
    /**
     * default {@link ChevronRightIcon}
     */
    icon?: React.ReactNode
}

const ViewListItem: React.FC<ViewListItemProps> = props => {

    const view: ViewDescriptor = props.view

    return (
        <ListItem
            key={view.id}
            sx={{
                p: 0,
                mb: 1,
            }}
        >
            {props.icon || <ChevronRightIcon />}
            <Tooltip
                title={"Sicht ${view.name} anzeigen"}
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
                        maxWidth: "100%",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {view.name}
                </Typography>
            </Tooltip>
        </ListItem>
    )
}

const AddViewButton: React.FC = () => {
    return (
        <Tooltip
            title={"Neue Sicht anlegen"}
            arrow
            TransitionComponent={Zoom}
            enterDelay={500}
            placement="right"
        >
            <IconButton size="medium">
                <AddBoxIcon />
            </IconButton>
        </Tooltip>
    )
}

export type ViewNavigatorProps = {
    open: boolean
}

export const ViewNavigator: React.FC<ViewNavigatorProps> = props => {
    const theme = useTheme()

    const { data } = useTable()
    const { views } = useViews(data?.metadata.descriptor)

    if (props.open === false) return null

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
                {views && views.map(view => <ViewListItem view={view} />)}
            </List>
            <AddViewButton />
        </Box>
    )
}
