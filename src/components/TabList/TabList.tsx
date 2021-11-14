import React, { useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import { Box, ToggleButtonGroup, ToggleButton, useTheme, Menu, MenuItem } from "@mui/material"

type TablistItemContextMenuProps = {
    anchorEL: Element
    open: boolean
    onClose: () => void
    children: Array<React.ReactNode> | React.ReactNode // overwrite implicit `children`
}
const TablistItemContextMenu: React.FC<TablistItemContextMenuProps> = props => {
    const theme = useTheme()

    return (
        <Menu
            elevation={0}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            // transformOrigin={{ vertical: "top", horizontal: "right" }}
            open={props.open}
            anchorEl={props.anchorEL}
            keepMounted={true}
            onClose={props.onClose}
            PaperProps={{
                sx: {
                    boxShadow: theme.shadows[1],
                },
            }}
        >
            {Array.isArray(props.children) ? (
                props.children.map((item, i) => <MenuItem key={i}>{item}</MenuItem>)
            ) : (
                <MenuItem>{props.children}</MenuItem>
            )}
        </Menu>
    )
}

export type TablistProps = {
    value: string | null
    data: Array<string>
    onChangeHandler: (val: string | null) => void
    onAddHandler: (name: string) => void
    contextMenuItems: Array<React.ReactNode> | React.ReactNode
}

export const ADD_BUTTON_TOKEN = "__ADD__"
export const Tablist: React.FC<TablistProps> = props => {
    const theme = useTheme()

    const [anchorEL, setAnchorEL] = useState<HTMLElement | null>(null)
    const handleOpenContextMenu = event => {
        event.preventDefault()
        setAnchorEL(event.currentTarget)
    }
    const handleCloseContextMenu = () => setAnchorEL(null)

    const handleOnChange = (_: unknown, val: string | null) => {
        // BUG: when creating a new proj without tables, the add button's value will be null for unknown reason.
        // because of that 'null' is catched and interpreteted as 'ADD_BUTTON_NAME'
        // TODO: fix this
        // NOTE: this causes a bug, where clicking on a already selected toggle button will pass the below if and prompt for adding a new entitiy
        if ((typeof val === "string" && val === ADD_BUTTON_TOKEN) || val === null) {
            const name = prompt("Choose new Name")
            if (name) props.onAddHandler(name)
        } else props.onChangeHandler(val)
    }

    return (
        <>
            <ToggleButtonGroup
                value={props.value || ADD_BUTTON_TOKEN}
                exclusive
                onChange={handleOnChange}
                color="primary"
                sx={{ display: "block", mb: theme.spacing(5) }}
            >
                {props.data.map((element, index) => (
                    <ToggleButton key={index} value={element} onContextMenu={handleOpenContextMenu}>
                        {element}
                    </ToggleButton>
                ))}
                <ToggleButton key={props.data.length} value={ADD_BUTTON_TOKEN}>
                    <AddIcon />
                </ToggleButton>
            </ToggleButtonGroup>

            <TablistItemContextMenu
                anchorEL={anchorEL}
                open={anchorEL != null}
                onClose={handleCloseContextMenu}
            >
                {props.contextMenuItems}
            </TablistItemContextMenu>
        </>
    )
}
