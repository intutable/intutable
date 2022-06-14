import { ColumnInfo, ViewDescriptor } from "@intutable/lazy-views/dist/types"
import Check from "@mui/icons-material/Check"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import SearchIcon from "@mui/icons-material/Search"
import {
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    useTheme,
} from "@mui/material"
import { useHeaderSearchField } from "context"
import { useColumn } from "hooks/useColumn"
import { useSnacki } from "hooks/useSnacki"
import React, { useState } from "react"
import { HeaderRendererProps } from "react-data-grid"
import { Row } from "types"
import { makeError } from "utils/error-handling/utils/makeError"
import { prepareName } from "utils/validateName"
import { AddLookup } from "./AddLookup"
import { ColumnToClipboard } from "./ColumnToClipboard"
import { CreateMailList } from "./CreateMailList"

export type ContextMenuProps = {
    colInfo: ColumnInfo
    foreignTable: ViewDescriptor | null | undefined
    headerRendererProps: HeaderRendererProps<Row>
}

export const ContextMenu: React.FC<ContextMenuProps> = props => {
    const { colInfo: col, foreignTable, headerRendererProps } = props

    const theme = useTheme()
    const { snackError } = useSnacki()

    const {
        open: headerOpen,
        openSearchField,
        closeSearchField,
    } = useHeaderSearchField()
    const { renameColumn, deleteColumn } = useColumn()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const handleOpenContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }
    const handleCloseContextMenu = () => setAnchorEL(null)

    const handleToggleHeaderSearchField = () => {
        if (headerOpen) closeSearchField()
        else openSearchField()
    }

    const handleRenameColumn = async () => {
        try {
            const name = prompt("Gib einen neuen Namen für diese Spalte ein:")
            if (!name) return
            await renameColumn(headerRendererProps.column, prepareName(name))
            handleCloseContextMenu()
        } catch (error) {
            const err = makeError(error)
            snackError(
                err.message === "alreadyTaken"
                    ? "Dieser Name ist bereits vergeben."
                    : "Die Spalte konnte nicht umbenannt werden!"
            )
        }
    }

    const handleDeleteColumn = async () => {
        try {
            const confirmed = confirm(
                "Möchtest du diese Spalte wirklich löschen?"
            )
            if (!confirmed) return
            await deleteColumn(headerRendererProps.column)
            handleCloseContextMenu()
        } catch (error) {
            const errMsg =
                (error as Record<string, string>).error === "deleteUserPrimary"
                    ? "Primärspalte kann nicht gelöscht werden."
                    : "Spalte konnte nicht gelöscht werden!"
            snackError(errMsg)
        }
    }

    return (
        <>
            <IconButton
                onClick={handleOpenContextMenu}
                size="small"
                edge="start"
            >
                <MoreVertIcon
                    sx={{
                        fontSize: "80%",
                    }}
                />
            </IconButton>
            <Menu
                elevation={0}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                // transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={anchorEL != null}
                anchorEl={anchorEL}
                keepMounted={true}
                onClose={handleCloseContextMenu}
                PaperProps={{
                    sx: {
                        boxShadow: theme.shadows[1],
                    },
                }}
            >
                <AddLookup
                    colInfo={col}
                    foreignTable={foreignTable}
                    onCloseContextMenu={handleCloseContextMenu}
                    headerRendererProps={headerRendererProps}
                />

                <CreateMailList
                    colInfo={col}
                    headerRendererProps={headerRendererProps}
                />

                <ColumnToClipboard
                    colInfo={col}
                    headerRendererProps={headerRendererProps}
                />

                <MenuItem onClick={handleToggleHeaderSearchField}>
                    <ListItemIcon>
                        {headerOpen ? <Check /> : <SearchIcon />}
                    </ListItemIcon>
                    <ListItemText>Suchleiste</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleRenameColumn}>
                    <ListItemText>Umbenennen</ListItemText>
                </MenuItem>

                <MenuItem disabled>
                    <ListItemText>Eigenschaften</ListItemText>
                </MenuItem>

                <MenuItem
                    onClick={handleDeleteColumn}
                    sx={{ color: theme.palette.warning.main }}
                >
                    <ListItemText>Löschen</ListItemText>
                </MenuItem>
            </Menu>
        </>
    )
}
