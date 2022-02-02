import React, { useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import {
    Box,
    ToggleButtonGroup,
    ToggleButton,
    useTheme,
    Menu,
    MenuItem,
} from "@mui/material"
import { TableList } from "@app/api"
import { useProject } from "@app/hooks/useProject"

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
                props.children.map((item, i) => (
                    <MenuItem key={i}>{item}</MenuItem>
                ))
            ) : (
                <MenuItem>{props.children}</MenuItem>
            )}
        </Menu>
    )
}

export const ADD_BUTTON_TOKEN = "__ADD__"
export const Tablist: React.FC = props => {
    const theme = useTheme()

    const [anchorEL, setAnchorEL] = useState<HTMLElement | null>(null)
    const handleOpenContextMenu = (event: {
        preventDefault: () => void
        currentTarget: React.SetStateAction<HTMLElement | null>
    }) => {
        event.preventDefault()
        setAnchorEL(event.currentTarget)
    }
    const handleCloseContextMenu = () => setAnchorEL(null)

    const {} = useProject()

    const handleOnChange = (_: unknown, val: string | null) => {
        // BUG: when creating a new proj without tables, the add button's value will be null for unknown reason.
        // because of that 'null' is catched and interpreteted as 'ADD_BUTTON_NAME'
        // TODO: fix this
        // NOTE: this causes a bug, where clicking on a already selected toggle button will pass the below if and prompt for adding a new entitiy
        if (
            (typeof val === "string" && val === ADD_BUTTON_TOKEN) ||
            val === null
        ) {
            const name = prompt("Choose new Name")
            if (name) props.onAddHandler(name)
        } else props.onChangeHandler(val)
    }

    const handleAddTable = useCallback(
        async (newTableName: string) => {
            const name = prepareName(newTableName)
            const isValid = isValidName(name)
            if (isValid instanceof Error)
                return enqueueSnackbar(isValid.message, {
                    variant: "error",
                })
            const nameIsTaken = state.project?.tables
                .map(tbl => tbl.tableName.toLowerCase().trim())
                .includes(name.toLowerCase().trim())
            if (nameIsTaken)
                return enqueueSnackbar(
                    "Dieser Name wird bereits für eine Tabelle in diesem Projekt verwendet!",
                    { variant: "error" }
                )
            if (!user)
                return enqueueSnackbar("Du musst dich zuvor erneut anmelden", {
                    variant: "error",
                })
            try {
                await API?.post.table(props.project.projectId, name)
                // await reload(name) // TODO: this should reload and switch to the new tab
                await reload()
                enqueueSnackbar(`Du hast erfolgreich '${name}' erstellt!`, {
                    variant: "success",
                })
            } catch (error) {
                console.error(error)
                enqueueSnackbar("Die Tabelle konnte nicht erstellt werden!", {
                    variant: "error",
                })
            }
        },
        [
            API?.post,
            enqueueSnackbar,
            props.project,
            reload,
            state.project?.tables,
            user,
        ]
    )

    const handleRenameTable = () => {
        alert("Not implemented yet")
        // TODO: implement
    }
    const handleDeleteTable = () => {
        alert("Not implemented yet")
        // TODO: implement
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
                    <ToggleButton
                        key={index}
                        value={element}
                        onContextMenu={handleOpenContextMenu}
                    >
                        {element}
                    </ToggleButton>
                ))}
                <ToggleButton key={props.data.length} value={ADD_BUTTON_TOKEN}>
                    <AddIcon />
                </ToggleButton>
            </ToggleButtonGroup>

            {anchorEL && (
                <TablistItemContextMenu
                    anchorEL={anchorEL}
                    open={anchorEL != null}
                    onClose={handleCloseContextMenu}
                >
                    <Box onClick={handleRenameTable} key={0}>
                        Rename
                    </Box>
                    ,
                    <Box
                        onClick={handleDeleteTable}
                        key={1}
                        sx={{ color: theme.palette.warning.main }}
                    >
                        Delete
                    </Box>
                    ,
                </TablistItemContextMenu>
            )}
        </>
    )
}
