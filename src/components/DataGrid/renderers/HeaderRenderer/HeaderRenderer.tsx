import { ColumnDescriptor } from "@intutable/project-management/dist/types"
import KeyIcon from "@mui/icons-material/Key"
import LinkIcon from "@mui/icons-material/Link"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import {
    Box,
    Divider,
    IconButton,
    InputAdornment,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material"
import { useHeaderSearchField, useTableCtx } from "context"
import { useSnacki } from "hooks/useSnacki"
import { useTables } from "hooks/useTables"
import { useRouter } from "next/router"
import React, { useEffect, useMemo, useState } from "react"
import { HeaderRendererProps } from "react-data-grid"
import { Column, Row } from "types"
import { AddLookupModal } from "./AddLookupModal"
import LookupIcon from "@mui/icons-material/ManageSearch"
import { fetcher } from "api/fetcher"
import { useUser } from "auth"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import SearchIcon from "@mui/icons-material/Search"
import Check from "@mui/icons-material/Check"

export const HeaderRenderer: React.FC<HeaderRendererProps<Row>> = props => {
    const theme = useTheme()
    const router = useRouter()
    const { user } = useUser()
    const { snackError, snackSuccess, snackWarning } = useSnacki()
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const { data, renameColumn, deleteColumn, utils, project } = useTableCtx()
    const {
        open: headerOpen,
        openSearchField,
        closeSearchField,
    } = useHeaderSearchField()

    const col = utils.getColumnByKey(props.column.key)
    // column that represents a link to another table
    const isLinkCol =
        col.joinId !== null && col.attributes.formatter === "linkColumn"
    const isLookupCol =
        col.joinId !== null && col.attributes.formatter !== "linkColumn"

    // const t = props.column.editorOptions?.renderFormatter
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

    const [anchorEL_LookupModal, setAnchorEL_LookupModal] =
        useState<Element | null>(null)
    const handleOpenLookupModal = (
        e: React.MouseEvent<HTMLLIElement, MouseEvent>
    ) => {
        e.preventDefault()
        setAnchorEL_LookupModal(e.currentTarget)
    }
    const handleCloseLookupModal = () => setAnchorEL_LookupModal(null)

    const handleAddLookup = async (column: ColumnDescriptor) => {
        if (!isLinkCol || !user) return
        try {
            const joinId = col.joinId!
            await fetcher(
                `/api/lookupField/${column.id}`,
                user,
                {
                    jtId: data!.metadata.descriptor.id,
                    joinId,
                },
                "POST"
            )
            await utils.mutate()
        } catch (error) {
            snackError("Der Lookup konnte nicht hinzugefügt werden!")
        }
    }

    const handleToggleHeaderSearchField = () => {
        console.log(headerOpen)
        if (headerOpen) closeSearchField()
        else openSearchField()
    }

    return (
        <Stack
            direction="column"
            sx={{
                width: "100%",
                height: "100%",
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    height: "35px",
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
                {isLookupCol && (
                    <Tooltip title={"(Lookup)"}>
                        <span>
                            <IconButton
                                onClick={() => snackWarning("Not Implemented.")}
                                size="small"
                            >
                                <LookupIcon />
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
                <Box>
                    <Tooltip title="Filter">
                        <IconButton size="small">
                            <FilterAltIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                    <IconButton onClick={handleOpenContextMenu} size="small">
                        <MoreVertIcon fontSize="inherit" />
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
                    {isLinkCol && [
                        <MenuItem key={0} onClick={handleOpenLookupModal}>
                            <ListItemIcon>
                                <LookupIcon />
                            </ListItemIcon>
                            <ListItemText>Lookup hinzufügen</ListItemText>
                        </MenuItem>,
                        <Divider key={1} />,
                    ]}
                    <MenuItem onClick={handleToggleHeaderSearchField}>
                        {headerOpen && (
                            <ListItemIcon>
                                <Check />
                            </ListItemIcon>
                        )}
                        <ListItemText>Suchleiste</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleRenameColumn}>
                        <ListItemText>Umbenennen</ListItemText>
                    </MenuItem>
                    <MenuItem
                        onClick={handleDeleteColumn}
                        sx={{ color: theme.palette.warning.main }}
                    >
                        <ListItemText>Löschen</ListItemText>
                    </MenuItem>
                    {foreignJt && (
                        <AddLookupModal
                            open={anchorEL_LookupModal != null}
                            onClose={handleCloseLookupModal}
                            onAddLookupModal={handleAddLookup}
                            foreignJt={foreignJt}
                        />
                    )}
                </Menu>
            </Box>
            {headerOpen && (
                <Box
                    sx={{
                        width: "100%",
                        height: "35px",
                        display: "inline-flex",
                        justifyContent: "center",
                        alignContent: "flex-start",
                        alignItems: "flex-start",
                        overflow: "hidden",
                    }}
                >
                    <TextField
                        sx={{
                            maxHeight: "20px",
                            width: "100%",
                        }}
                        size="small"
                        disabled
                        variant="outlined"
                        value="Suche"
                        margin="none"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                        inputProps={{
                            style: {
                                height: "30px",
                                padding: "0 14px",
                            },
                        }}
                    />
                </Box>
            )}
        </Stack>
    )
}

export const headerRenderer = (props: HeaderRendererProps<Row>) => (
    <HeaderRenderer {...props} />
)
