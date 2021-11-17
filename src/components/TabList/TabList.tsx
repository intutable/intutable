import React from "react"
import AddIcon from "@mui/icons-material/Add"
import { Box, ToggleButtonGroup, ToggleButton, useTheme } from "@mui/material"

export type TablistProps = {
    value: string | null
    data: Array<string>
    onChangeHandler: (val: string | null) => void
    onAddHandler: (name: string) => void
}

export const ADD_BUTTON_TOKEN = "__ADD__"
export const Tablist: React.FC<TablistProps> = props => {
    const theme = useTheme()

    const handler = (_: unknown, val: string | null) => {
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
        <ToggleButtonGroup
            value={props.value || ADD_BUTTON_TOKEN}
            exclusive
            onChange={handler}
            color="primary"
            sx={{ display: "block", mb: theme.spacing(5) }}
        >
            {props.data.map((element, index) => (
                <ToggleButton key={index} value={element}>
                    {element}
                </ToggleButton>
            ))}
            <ToggleButton key={props.data.length} value={ADD_BUTTON_TOKEN}>
                <AddIcon />
            </ToggleButton>
        </ToggleButtonGroup>
    )
}
