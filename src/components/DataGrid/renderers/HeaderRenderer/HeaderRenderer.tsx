import { ColumnDescriptor } from "@intutable/project-management/dist/types"
import KeyIcon from "@mui/icons-material/Key"
import LinkIcon from "@mui/icons-material/Link"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import {
    Box,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material"
import { useTableCtx } from "context"
import { useSnacki } from "hooks/useSnacki"
import { useTables } from "hooks/useTables"
import { useRouter } from "next/router"
import React, { useMemo, useState } from "react"
import { HeaderRendererProps } from "react-data-grid"
import { Row } from "types"
import { AddLookupModal } from "./AddLookupModal"
import LookupIcon from "@mui/icons-material/ManageSearch"

export const HeaderRenderer: React.FC<HeaderRendererProps<Row>> = props => {
    const theme = useTheme()
    const router = useRouter()
    const { snackError, snackSuccess, snackWarning, snack } = useSnacki()
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const { data, renameColumn, deleteColumn, utils, project } = useTableCtx()

    const col = utils.getColumnByKey(props.column.key)
    // column that represents a link to another table
    const isLinkCol = col.joinId !== null
    // a user-facing primary column distinct from the table's real PK
    const isUserPrimary = col.attributes.userPrimary === 1
    const { tables } = useTables(project)

    const foreignJt = useMemo(() => {
        if (!data || !tables) return undefined
        const join = data.metadata.joins.find(j => j.id === col.joinId)
        return tables.find(t => t.id === join?.foreignJtId)
    }, [col.joinId, tables, data])

    const handleOpenContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }
    const handleCloseContextMenu = () => setAnchorEL(null)

    const handleDeleteColumn = async () => {
        try {
            const confirmed = confirm(
                "Möchtest du diese Spalte wirklich löschen?"
            )
            if (!confirmed) return
            await deleteColumn(props.column.key)
            snackSuccess("Spalte wurde gelöscht.")
        } catch (error) {
            const errMsg =
                (error as Record<string, string>).error === "deleteUserPrimary"
                    ? "Primärspalte kann nicht gelöscht werden."
                    : "Spalte konnte nicht gelöscht werden!"
            snackError(errMsg)
        }
    }

    const navigateToJT = () =>
        router.push(`/project/${project.id}/table/${foreignJt?.id}`)

    const handleRenameColumn = async () => {
        try {
            const name = prompt("Gib einen neuen Namen für diese Spalte ein:")
            if (!name) return
            // TODO: check if the column name is already taken
            await renameColumn(props.column.key, name)
            snackSuccess("Die Spalte wurde umbenannt.")
        } catch (error) {
            const errMsg =
                error === "alreadyTaken"
                    ? `Der Name ${name} ist bereits vergeben.`
                    : "Die Spalte konnte nicht umbenannt werden!"
            snackError(errMsg)
        }
    }

    const [anchorEL_LookupCellModal, setAnchorEL_LookupCellModal] =
        useState<Element | null>(null)
    const handleOpenLookupCellModal = (
        e: React.MouseEvent<HTMLLIElement, MouseEvent>
    ) => {
        e.preventDefault()
        setAnchorEL_LookupCellModal(e.currentTarget)
    }
    const handleCloseLookupCellModal = () => setAnchorEL_LookupCellModal(null)

    const handleAddLookupCell = async (column: ColumnDescriptor) => {
        try {
            snack(`Spalte '${column.name}' wird als Lookup-Spalte hinzugefügt`)
        } catch (error) {
            snackError("Die Lookup-Zelle konnte nicht hinzugefügt werden!")
        }
    }

    return (
        <>
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    display: "inline-flex",
                    justifyContent: "flex-start",
                    alignContent: "center",
                    alignItems: "center",
                }}
            >
                {isLinkCol && (
                    <Tooltip
                        title={`(Verlinkte Spalte) Ursprung: Primärspalte aus Tabelle '${
                            foreignJt ? foreignJt.name : "Lädt..."
                        }'.`}
                    >
                        <span>
                            <IconButton
                                onClick={navigateToJT}
                                size="small"
                                disabled={foreignJt == null}
                            >
                                <LinkIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                )}
                {isUserPrimary && (
                    <Tooltip
                        title={
                            "(Primärspalte). Inhalt sollte einzigartig sein," +
                            " z.B. ein Name oder eine ID-Nummer."
                        }
                    >
                        <span>
                            <IconButton
                                onClick={() => snackWarning("Not Implemented.")}
                                size="small"
                            >
                                <KeyIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                )}
                <Tooltip title={props.column.name}>
                    <Typography
                        sx={{
                            fontWeight: "bold",
                        }}
                    >
                        {props.column.name}
                    </Typography>
                </Tooltip>
                <Box sx={{ flex: 1 }} />
                <IconButton
                    onClick={handleOpenContextMenu}
                    sx={{
                        transform: "scale(0.6)",
                    }}
                >
                    <MoreVertIcon />
                </IconButton>
            </Box>
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
                {isLinkCol && (
                    <>
                        <MenuItem onClick={handleOpenLookupCellModal}>
                            <ListItemIcon>
                                <LookupIcon />
                            </ListItemIcon>
                            <ListItemText>Lookup hinzufügen</ListItemText>
                        </MenuItem>
                        <Divider />
                    </>
                )}
                <MenuItem onClick={handleRenameColumn}>
                    <ListItemText>Umbenennen</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={handleDeleteColumn}
                    sx={{ color: theme.palette.warning.main }}
                >
                    <ListItemText>Löschen</ListItemText>
                </MenuItem>
            </Menu>
            {foreignJt && (
                <AddLookupModal
                    open={anchorEL_LookupCellModal != null}
                    onClose={handleCloseLookupCellModal}
                    onAddLookupModal={handleAddLookupCell}
                    foreignJt={foreignJt}
                />
            )}
        </>
    )
}

export const headerRenderer = (props: HeaderRendererProps<Row>) => (
    <HeaderRenderer {...props} />
)
