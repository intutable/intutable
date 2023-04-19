import Check from "@mui/icons-material/Check"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import SearchIcon from "@mui/icons-material/Search"
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useHeaderSearchField } from "context"
import { useColumn } from "hooks/useColumn"
import { useSnacki } from "hooks/useSnacki"
import React, { useEffect, useRef, useState } from "react"
import { CalculatedColumn, HeaderRendererProps } from "react-data-grid"
import { Row } from "types"
import { AddLookup } from "./AddLookup"
import { ColumnAttributesWindowButton } from "./ColumnAttributesWindow"
import { ColumnToClipboard } from "./ColumnToClipboard"
import { CreateMailList } from "./CreateMailList"

export type ColumnContextMenuProps = {
    headerRendererProps: HeaderRendererProps<Row>
}
/** // HACK */
const useFixedColumn = () => {
    const { changeAttributes } = useColumn()

    const locked = useRef<Map<CalculatedColumn<Row>, { resizable: boolean }>>(new Map())

    const cleanup = () => {
        Array.from(locked.current.entries()).forEach(fixedColumn => free(fixedColumn[0]))
    }

    useEffect(() => {
        // TODO: when view or table data changed, check if the resizable property has changed
        // for one of the locked columns, if so, remove it
    }, [])

    useEffect(() => {
        window.addEventListener("beforeunload", cleanup)

        return () => window.removeEventListener("beforeunload", cleanup)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const lock = async (column: CalculatedColumn<Row>) => {
        if (column.resizable || !locked.current.has(column)) {
            await changeAttributes(column, { resizable: false })
            locked.current.set(column, { resizable: column.resizable })
        }
    }

    const free = async (column: CalculatedColumn<Row>) => {
        if (locked.current.has(column)) {
            const lastState = locked.current.get(column)!
            await changeAttributes(column, { resizable: lastState.resizable })
            locked.current.delete(column)
        }
    }

    return {
        lock,
        free,
    }
}

export const ColumnContextMenu: React.FC<ColumnContextMenuProps> = props => {
    const { headerRendererProps } = props

    const theme = useTheme()
    const { snackError } = useSnacki()

    const { open: headerOpen, openSearchField, closeSearchField } = useHeaderSearchField()
    const { deleteColumn, changeAttributes } = useColumn()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const openContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
        // changeAttributes(headerRendererProps.column, { resizable: false }) // HACK , but does not work either

        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }
    const closeContextMenu = async () => {
        // await changeAttributes(headerRendererProps.column, { resizable: true }) // HACK , but does not work either

        setAnchorEL(null)
    }

    const toggleHeaderSearchbar = () => {
        if (headerOpen) closeSearchField()
        else openSearchField()
    }

    const handleDeleteColumn = async () => {
        try {
            const confirmed = confirm("Möchtest du diese Spalte wirklich löschen?")
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
                {["link", "backwardLink"].includes(headerRendererProps.column.kind) && (
                    <AddLookup headerRendererProps={headerRendererProps} />
                )}

                <CreateMailList headerRendererProps={headerRendererProps} />

                <ColumnToClipboard headerRendererProps={headerRendererProps} />

                <MenuItem onClick={toggleHeaderSearchbar}>
                    <ListItemIcon>{headerOpen ? <Check /> : <SearchIcon />}</ListItemIcon>
                    <ListItemText>Suchleiste</ListItemText>
                </MenuItem>

                <ColumnAttributesWindowButton
                    headerRendererProps={headerRendererProps}
                    onCloseContextMenu={closeContextMenu}
                />

                <MenuItem onClick={handleDeleteColumn} sx={{ color: theme.palette.warning.main }}>
                    <ListItemText>Löschen</ListItemText>
                </MenuItem>
            </Menu>
        </>
    )
}
