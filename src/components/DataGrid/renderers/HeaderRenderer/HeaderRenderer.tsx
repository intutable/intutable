import { asView } from "@intutable/lazy-views/dist/selectable"
import { ColumnInfo } from "@intutable/lazy-views/dist/types"
import Check from "@mui/icons-material/Check"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import KeyIcon from "@mui/icons-material/Key"
import LinkIcon from "@mui/icons-material/Link"
import LookupIcon from "@mui/icons-material/ManageSearch"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import SearchIcon from "@mui/icons-material/Search"
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
import { fetcher } from "api/fetcher"
import { useUser } from "auth"
import { useAPI, useHeaderSearchField } from "context"
import { useColumn, getColumnInfo } from "hooks/useColumn"
import { useSnacki } from "hooks/useSnacki"
import { useTable } from "hooks/useTable"
import { useTables } from "hooks/useTables"
import { useRouter } from "next/router"
import React, { useMemo, useState } from "react"
import { HeaderRendererProps } from "react-data-grid"
import { Row } from "types"
import { makeError } from "utils/error-handling/utils/makeError"
import { prepareName } from "utils/validateName"
import { AddLookupModal } from "./AddLookupModal"

export const HeaderRenderer: React.FC<HeaderRendererProps<Row>> = props => {
    const theme = useTheme()
    const router = useRouter()
    const { user } = useUser()
    const { snackError, snackSuccess, snackWarning } = useSnacki()
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)

    const { data, mutate } = useTable()
    const { renameColumn, deleteColumn } = useColumn()
    const { project } = useAPI()

    const {
        open: headerOpen,
        openSearchField,
        closeSearchField,
    } = useHeaderSearchField()

    const col = useMemo(
        () =>
            data ? getColumnInfo(data.metadata.columns, props.column) : null,
        [data, props.column]
    )
    // column that represents a link to another table
    const isLinkCol = props.column._kind! === "link"
    const isLookupCol = props.column._kind! === "lookup"

    // const t = props.column.editorOptions?.renderFormatter
    // a user-facing primary column distinct from the table's real PK
    const isUserPrimary = useMemo(
        () => (col ? col.attributes.userPrimary === 1 : null),
        [col]
    )
    const { tables } = useTables(project)

    const foreignView = useMemo(() => {
        if (col == null) return null
        if (!data || !tables) return undefined
        const join = data.metadata.joins.find(j => j.id === col.joinId)
        if (!join) return undefined
        return tables.find(t => t.id === asView(join.foreignSource).id)
    }, [col, tables, data])

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
            await deleteColumn(props.column)
            snackSuccess("Spalte wurde gelöscht.")
        } catch (error) {
            const errMsg =
                (error as Record<string, string>).error === "deleteUserPrimary"
                    ? "Primärspalte kann nicht gelöscht werden."
                    : "Spalte konnte nicht gelöscht werden!"
            snackError(errMsg)
        }
    }

    const navigateToView = () =>
        router.push(`/project/${project!.id}/table/${foreignView?.id}`)

    const handleRenameColumn = async () => {
        try {
            const name = prompt("Gib einen neuen Namen für diese Spalte ein:")
            if (!name) return
            await renameColumn(props.column, prepareName(name))
        } catch (error) {
            const err = makeError(error)
            if (err.message === "alreadyTaken")
                snackError(
                    err.message === "alreadyTaken"
                        ? "Dieser Name ist bereits vergeben."
                        : "Die Spalte konnte nicht umbenannt werden!"
                )
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

    const handleAddLookup = async (column: ColumnInfo) => {
        if (!isLinkCol || !user) return
        try {
            const joinId = col!.joinId!
            await fetcher({
                url: `/api/lookupField/${column.id}`,
                body: {
                    viewId: data!.metadata.descriptor.id,
                    joinId,
                },
            })
            await mutate()
        } catch (error) {
            snackError("Der Lookup konnte nicht hinzugefügt werden!")
        }
    }

    const handleToggleHeaderSearchField = () => {
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
                            foreignView ? foreignView.name : "Lädt..."
                        }'.`}
                    >
                        <span>
                            <IconButton
                                onClick={navigateToView}
                                size="small"
                                disabled={foreignView == null}
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
                    {foreignView && (
                        <AddLookupModal
                            open={anchorEL_LookupModal != null}
                            onClose={handleCloseLookupModal}
                            onAddLookupModal={handleAddLookup}
                            foreignView={foreignView}
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