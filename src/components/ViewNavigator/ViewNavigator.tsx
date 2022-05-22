import React from "react"
import { List, ListItem } from "@mui/material"
import { SxProps, Theme } from "@mui/system"

export type ViewNavigatorProps = {
    sx: SxProps<Theme>
}

export const ViewNavigator: React.FC<ViewNavigatorProps> = props => {
    return (
        <List
            sx={{
                float: "left",
                ...props.sx,
            }}
        >
            <ListItem key={1}>View1</ListItem>
            <ListItem key={2}>View2</ListItem>
            <ListItem key={2}>
                ThisViewHasASomewhatLongerNameThanMostDo
            </ListItem>
        </List>
    )
}
