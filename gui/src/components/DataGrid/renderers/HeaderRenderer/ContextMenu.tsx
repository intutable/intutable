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
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useHeaderSearchField } from "context"
import { useColumn } from "hooks/useColumn"
import { useSnacki } from "hooks/useSnacki"
import React, { useState } from "react"
import { HeaderRendererProps } from "react-data-grid"
import { Row } from "types"
import { AddLookup } from "./AddLookup"
import { ColumnAttributesWindow } from "./ColumnAttributesWindow"
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
    const { deleteColumn } = useColumn()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const openContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }
    const closeContextMenu = () => setAnchorEL(null)

    const toggleHeaderSearchbar = () => {
        if (headerOpen) closeSearchField()
        else openSearchField()
    }

    const handleDeleteColumn = async () => {
        try {
            const confirmed = confirm(
                "Möchtest du diese Spalte wirklich löschen?"
            )
            if (!confirmed) return
            await deleteColumn(headerRendererProps.column)
            closeContextMenu()
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
            <IconButton onClick={openContextMenu} size="small" edge="start">
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
                onClose={closeContextMenu}
                PaperProps={{
                    sx: {
                        boxShadow: theme.shadows[1],
                    },
                }}
            >
                <AddLookup
                    colInfo={col}
                    foreignTable={foreignTable}
                    onCloseContextMenu={closeContextMenu}
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

                <MenuItem onClick={toggleHeaderSearchbar}>
                    <ListItemIcon>
                        {headerOpen ? <Check /> : <SearchIcon />}
                    </ListItemIcon>
                    <ListItemText>Suchleiste</ListItemText>
                </MenuItem>

                <ColumnAttributesWindow
                    headerRendererProps={headerRendererProps}
                    onCloseContextMenu={closeContextMenu}
                />

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
