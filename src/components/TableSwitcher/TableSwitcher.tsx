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
import { isValidName, prepareName } from "@app/utils/validateName"
import { useRouter } from "next/router"
import { useSnackbar } from "notistack"

export const ADD_BUTTON_TOKEN = "___ADD_TABLE___"

export const TableSwitcher: React.FC = () => {
    const theme = useTheme()
    const router = useRouter()

    const { state, loading, setTable, createTable, deleteTable, renameTable } =
        useProjectCtx()
    const { enqueueSnackbar } = useSnackbar()
    const [anchorEL, setAnchorEL] = useState<HTMLButtonElement | null>(null)

    useEffect(() => {
        if (state?.currentTable == null) {
            const firstTableInList = state?.tableList[0]
            if (firstTableInList == null) return
            setTable(firstTableInList)
        }
    }, [setTable, state?.currentTable, state?.tableList])

    const handleOpenContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }
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
            await setTable(tableById!)
        }
    }

    const handleRenameTable = async () => {
        try {
            handleCloseContextMenu()
            if (anchorEL == null) return
            const tableId = Number.parseInt(anchorEL.value) as PM.Table.ID
            if (tableId == null) return
            const table = state?.tableList.find(tbl => tbl.tableId === tableId)
            if (table == null) return
            const newName = prompt(
                "Gib einen neuen Namen für deine Tabelle ein:"
            )
            if (!newName) return
            await renameTable(table, newName)
            router.replace(router.asPath)
            enqueueSnackbar("Die Tabelle wurde umbenannt.", {
                variant: "success",
            })
        } catch (error) {
            console.log(error)
            enqueueSnackbar("Die Tabelle konnte nicht umbenannt werden!", {
                variant: "error",
            })
        }
    }

    const handleDeleteTable = async () => {
        try {
            handleCloseContextMenu()
            if (anchorEL == null) return
            const tableId = Number.parseInt(anchorEL.value) as PM.Table.ID
            if (tableId == null) return
            const table = state?.tableList.find(tbl => tbl.tableId === tableId)
            if (table == null) return
            const confirmed = confirm(
                "Möchtest du deine Tabelle wirklich löschen?"
            )
            if (!confirmed) return
            await deleteTable(table)
            router.replace(router.asPath)
            enqueueSnackbar("Tabelle wurde gelöscht.", {
                variant: "success",
            })
        } catch (error) {
            console.log(error)
            enqueueSnackbar("Tabelle konnte nicht gelöscht werden!", {
                variant: "error",
            })
        }
    }

    const handleCreateTable = async (): Promise<void> => {
        try {
            const namePrompt = prompt("Benenne Dein neue Tabelle!")
            if (!namePrompt) return
            const name = prepareName(namePrompt)
            // const isValid = isValidName(name)
            // if (isValid instanceof Error) {
            //     enqueueSnackbar(isValid.message, {
            //         variant: "error",
            //     })
            //     return
            // }
            // const nameIsTaken = state?.tableList
            //     .map(tbl => tbl.tableName.toLowerCase())
            //     .includes(name.toLowerCase())
            // if (nameIsTaken) {
            //     enqueueSnackbar(
            //         "Dieser Name wird bereits für eine Tabelle in diesem Projekt verwendet!",
            //         { variant: "error" }
            //     )
            //     return
            // }
            await createTable(name)
            router.replace(router.asPath)
            enqueueSnackbar(`Du hast erfolgreich '${name}' erstellt!`, {
                variant: "success",
            })
        } catch (error) {
            console.log(error)
            enqueueSnackbar("Die Tabelle konnte nicht erstellt werden!", {
                variant: "error",
            })
        }
    }

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
