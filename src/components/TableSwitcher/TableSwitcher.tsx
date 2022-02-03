import React, { useEffect, useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import {
    Box,
    ToggleButtonGroup,
    ToggleButton,
    useTheme,
    Menu,
    MenuItem,
} from "@mui/material"
import { ProjectManagement as PM } from "@api"
import { useProjectCtx } from "@context/ProjectContext"

export const ADD_BUTTON_TOKEN = "___ADD_TABLE___"

export const TableSwitcher: React.FC = () => {
    const theme = useTheme()

    const { state, loading, setTable, setProject } = useProjectCtx()
    const [anchorEL, setAnchorEL] = useState<HTMLElement | null>(null)

    useEffect(() => {
        if (state?.currentTable == null) {
            const firstTableInList = state?.tableList[0]
            if (firstTableInList == null) return
            setTable(firstTableInList)
        }
    }, [setTable, state?.currentTable, state?.tableList])

    const handleOpenContextMenu = (e: React.MouseEvent<HTMLButtonElement>) =>
        setAnchorEL(e.currentTarget)
    const handleCloseContextMenu = () => setAnchorEL(null)

    const handleSetTable = async (_: unknown, val: string | null | number) => {
        // BUG: when creating a new proj without tables, the add button's value will be null for unknown reason.
        // because of that 'null' is catched and interpreteted as 'ADD_BUTTON_NAME'
        // TODO: fix this
        // NOTE: this causes a bug, where clicking on a already selected toggle button will pass the below if and prompt for adding a new entitiy
        if (val === ADD_BUTTON_TOKEN || val == null) {
            await handleCreateTable()
        } else {
            const tableById = state?.tableList.find(
                tbl => tbl.tableId === (val as number)
            )
            console.log(tableById)
            await setTable(tableById!)
        }
    }

    const handleRenameTable = async () => {}
    const handleDeleteTable = async () => {}
    const handleCreateTable = async () => {}

    if (loading || state == null) return null

    return (
        <>
            <ToggleButtonGroup
                value={state.currentTable?.table.tableId || ADD_BUTTON_TOKEN}
                exclusive
                onChange={handleSetTable}
                color="primary"
                sx={{ display: "block", mb: theme.spacing(5) }}
            >
                {state.tableList.map((table, index) => (
                    <ToggleButton
                        key={index}
                        value={table.tableId}
                        onContextMenu={handleOpenContextMenu}
                    >
                        {table.tableName}
                    </ToggleButton>
                ))}
                <ToggleButton
                    key={state.tableList.length + 1}
                    value={ADD_BUTTON_TOKEN}
                >
                    <AddIcon />
                </ToggleButton>
            </ToggleButtonGroup>

            {/* Context Menu */}
            {anchorEL && (
                <Menu
                    elevation={0}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    // transformOrigin={{ vertical: "top", horizontal: "right" }}
                    open={anchorEL != null}
                    anchorEl={anchorEL}
                    keepMounted
                    onClose={handleCloseContextMenu}
                    PaperProps={{
                        sx: {
                            boxShadow: theme.shadows[1],
                        },
                    }}
                >
                    <MenuItem onClick={handleRenameTable}>Umbennen</MenuItem>
                    <MenuItem
                        onClick={handleDeleteTable}
                        sx={{ color: theme.palette.warning.main }}
                    >
                        Löschen
                    </MenuItem>
                </Menu>
            )}
        </>
    )
}
