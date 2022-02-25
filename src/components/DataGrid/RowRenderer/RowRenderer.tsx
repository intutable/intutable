import { useTableCtx } from "context"
import { Row } from "types"
import { Menu, MenuItem, useTheme, Box } from "@mui/material"
import { useSnackbar } from "notistack"
import React, { useCallback, useState } from "react"
import { RowRendererProps, Row as GridRow } from "react-data-grid"

/**
 * // TODO:
 * This component needs to be highly performant and memoized.
 * Consider optimizing this soon.
 */

/**
 * Row Renderer
 */
const _RowRenderer = (props: RowRendererProps<Row>) => {
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()
    const { deleteRow } = useTableCtx()

    const [anchorEL, setAnchorEL] = useState<HTMLDivElement | null>(null)

    const handleOpenContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault()
        setAnchorEL(event.currentTarget.children[0] as HTMLDivElement)
    }
    const handleCloseContextMenu = () => setAnchorEL(null)

    const handleDeleteRow = useCallback(
        async (index: number, row: Row) => {
            try {
                handleCloseContextMenu()
                await deleteRow(index, row)
            } catch (error) {
                enqueueSnackbar("Die Zeile konnte nicht gelöscht werden.")
            }
        },
        [deleteRow, enqueueSnackbar]
    )

    const handleCreateRow = useCallback((atIndex: number) => {
        // try {
        //     handleCloseContextMenu()
        //     // TODO: shift rows
        // } catch (error) {
        //     enqueueSnackbar("Es konnte keine Zeile eingefügt werden.")
        // }
    }, [])

    return (
        <>
            <GridRow onContextMenu={handleOpenContextMenu} {...props} />
            <Menu
                elevation={0}
                // anchorOrigin={{ vertical: "top", horizontal: "right" }}
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
                <MenuItem onClick={handleCreateRow.bind(null, props.rowIdx)}>
                    Zeile oberhalb einfügen
                </MenuItem>
                <MenuItem
                    onClick={handleDeleteRow.bind(
                        null,
                        props.rowIdx,
                        props.row
                    )}
                    sx={{ color: theme.palette.warning.main }}
                >
                    Zeile löschen
                </MenuItem>
                <MenuItem
                    onClick={handleCreateRow.bind(null, props.rowIdx + 1)}
                >
                    Zeile unterhalb einfügen
                </MenuItem>
            </Menu>
        </>
    )
}

export const RowRenderer = React.memo(_RowRenderer)
