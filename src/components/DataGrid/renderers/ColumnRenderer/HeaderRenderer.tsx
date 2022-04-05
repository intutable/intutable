import MoreVertIcon from "@mui/icons-material/MoreVert"
import {
    Box,
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material"
import { useTableCtx } from "context"
import { useSnackbar } from "notistack"
import React, { useMemo, useState } from "react"
import { HeaderRendererProps } from "react-data-grid"
import { Row } from "types"
import LinkIcon from "@mui/icons-material/Link"
import KeyIcon from "@mui/icons-material/Key"
import { useRouter } from "next/router"
import { useTables } from "hooks/useTables"

export const HeaderRenderer: React.FC<HeaderRendererProps<Row>> = props => {
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()
    const router = useRouter()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)

    const { renameColumn, deleteColumn, utils, project } = useTableCtx()

    const col = utils.getColumnByKey(props.column.key)
    // column that represents a link to another table
    const isLinkCol = col.joinId !== null
    // a user-facing primary column distinct from the table's real PK
    const isUserPrimary = col.attributes.userPrimary === 1
    const { tables } = useTables(project)
    const foreignJt = useMemo(
        () => tables?.find(tbl => tbl.id === col.joinId),
        [col.joinId, tables]
    )

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
            enqueueSnackbar("Spalte wurde gelöscht.", {
                variant: "success",
            })
        } catch (error) {
            if (
                (error as Record<string, string>).error === "deleteUserPrimary"
            ) {
                enqueueSnackbar("Primärspalte kann nicht gelöscht werden.", {
                    variant: "error",
                })
            } else {
                enqueueSnackbar("Spalte konnte nicht gelöscht werden!", {
                    variant: "error",
                })
            }
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
            enqueueSnackbar("Die Spalte wurde umbenannt.", {
                variant: "success",
            })
        } catch (error) {
            if (error === "alreadyTaken")
                enqueueSnackbar(`Der Name ${name} ist bereits vergeben.`, {
                    variant: "error",
                })
            else
                enqueueSnackbar("Die Spalte konnte nicht umbenannt werden!", {
                    variant: "error",
                })
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
                        title={`Ursprung: ${
                            foreignJt ? foreignJt.name : "Lädt..."
                        }`}
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
                            "Primärspalte. Inhalt sollte einzigartig sein," +
                            " z.B. ein Name oder eine ID-Nummer."
                        }
                    >
                        <span>
                            <IconButton size="small" disabled={true}>
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
            {anchorEL && (
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
                    <MenuItem onClick={handleRenameColumn}>Umbenennen</MenuItem>
                    <MenuItem
                        onClick={handleDeleteColumn}
                        sx={{ color: theme.palette.warning.main }}
                    >
                        Löschen
                    </MenuItem>
                </Menu>
            )}
        </>
    )
}

export const headerRenderer = (props: HeaderRendererProps<Row>) => (
    <HeaderRenderer {...props} />
)
