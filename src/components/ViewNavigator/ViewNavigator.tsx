import {
    Box,
    List,
    ListItem,
    Tooltip,
    Typography,
    useTheme,
    Button,
    IconButton,
    Divider,
} from "@mui/material"
import React from "react"
import Zoom from "@mui/material/Zoom"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import AddIcon from "@mui/icons-material/Add"

type ViewListItemProps = {
    children: React.ReactNode
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
    if (typeof props.children !== "string" && props.title == null)
        throw new RangeError(
            "A value for 'title' is required if `children` is not a string!"
        )

    return (
        <ListItem
            key={
                typeof props.children === "string"
                    ? props.children
                    : props.title!
            }
            sx={{
                p: 0,
                mb: 1,
            }}
        >
            {props.icon || <ChevronRightIcon />}
            <Tooltip
                title={
                    typeof props.children === "string"
                        ? props.children
                        : props.title!
                }
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
                    {props.children}
                </Typography>
            </Tooltip>
        </ListItem>
    )
}
export type ViewNavigatorProps = {
    open: boolean
}

export const ViewNavigator: React.FC<ViewNavigatorProps> = props => {
    const theme = useTheme()

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
                <ViewListItem>View1</ViewListItem>
                <ViewListItem>View2</ViewListItem>
                <ViewListItem>
                    ThisViewHasASomewhatLongerNameThanMostDo
                </ViewListItem>
                <ViewListItem title={""} icon={<AddIcon />}>
                    <Box
                        sx={{
                            cursor: "pointer",
                        }}
                    >
                        Add View
                    </Box>
                </ViewListItem>
            </List>
        </Box>
    )
}
