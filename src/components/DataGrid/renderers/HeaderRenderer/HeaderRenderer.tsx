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
import { useColumn } from "hooks/useColumn"
import { useSnacki } from "hooks/useSnacki"
import { useTables } from "hooks/useTables"
import { useTable } from "hooks/useTable"
import { useView } from "hooks/useView"
import { useRouter } from "next/router"
import React, { useEffect, useMemo, useState } from "react"
import { HeaderRendererProps, useRowSelection } from "react-data-grid"
import { Row } from "types"
import { makeError } from "utils/error-handling/utils/makeError"
import { prepareName } from "utils/validateName"
import { AddLookupModal } from "./AddLookupModal"
import DownloadingIcon from "@mui/icons-material/Downloading"
import { GenerateMailListDialog } from "./GenerateMailListDialog"
import ContentPasteIcon from "@mui/icons-material/ContentPaste"
import { columnToClipboard } from "utils/columnToClipboard"
import { isValidMailAddress } from "utils/isValidMailAddress"
import { useSelectedRows } from "context/SelectedRowsContext"
import { ColumnToClipboard } from "./ColumnToClipboard"
import { SearchBar } from "./SearchBar"

export const HeaderRenderer: React.FC<HeaderRendererProps<Row>> = props => {
    const theme = useTheme()
    const router = useRouter()
    const { user } = useUser()
    const { snackError, snackSuccess, snackWarning, snackInfo } = useSnacki()
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)

    const { selectedRows } = useSelectedRows()
    const { data, mutate: mutateTable } = useTable()
    const { mutate: mutateView } = useView()
    const { renameColumn, deleteColumn, getTableColumn } = useColumn()
    const { project } = useAPI()

    const {
        open: headerOpen,
        openSearchField,
        closeSearchField,
    } = useHeaderSearchField()

    const col = useMemo(
        () => (data ? getTableColumn(props.column) : null),
        [data, getTableColumn, props.column]
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
    const { tables } = useTables()

    const foreignTable = useMemo(() => {
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
        router.push(`/project/${project!.id}/table/${foreignTable?.id}`)

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
                    tableViewId: data!.metadata.descriptor.id,
                    joinId,
                },
            })
            await mutateTable()
            await mutateView()
            handleCloseContextMenu()
        } catch (error) {
            snackError("Der Lookup konnte nicht hinzugefügt werden!")
        }
    }

    const [anchorEL_GenerateMailList, setAnchorEL_GenerateMailList] =
        useState<Element | null>(null)
    const handleOpenGenerateMailList = (
        e: React.MouseEvent<HTMLLIElement, MouseEvent>
    ) => {
        e.preventDefault()
        setAnchorEL_GenerateMailList(e.currentTarget)
    }
    const handleCloseGenerateMailList = () => setAnchorEL_GenerateMailList(null)

    const handleToggleHeaderSearchField = () => {
        if (headerOpen) closeSearchField()
        else openSearchField()
    }

    if (col == null) return null

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
                    whiteSpace: "nowrap",
                }}
            >
                {isLinkCol && (
                    <Tooltip
                        title={`(Verlinkte Spalte) Ursprung: Primärspalte aus Tabelle '${
                            foreignTable ? foreignTable.name : "Lädt..."
                        }'.`}
                    >
                        <span>
                            <IconButton
                                onClick={navigateToView}
                                size="small"
                                disabled={foreignTable == null}
                            >
                                <LinkIcon
                                    sx={{
                                        fontSize: "90%",
                                    }}
                                />
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
                                <KeyIcon
                                    sx={{
                                        fontSize: "80%",
                                    }}
                                />
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
                                <LookupIcon
                                    sx={{
                                        fontSize: "90%",
                                    }}
                                />
                            </IconButton>
                        </span>
                    </Tooltip>
                )}

                <Box
                    sx={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    <Tooltip title={props.column.name}>
                        <Typography
                            sx={{
                                fontWeight: "bold",
                            }}
                        >
                            {props.column.name}
                        </Typography>
                    </Tooltip>
                </Box>

                <Box>
                    <Tooltip title="Filter">
                        <IconButton size="small" edge="end">
                            <FilterAltIcon
                                sx={{
                                    fontSize: "80%",
                                }}
                            />
                        </IconButton>
                    </Tooltip>
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
                    {col &&
                        Object.prototype.hasOwnProperty.call(
                            col,
                            "attributes"
                        ) &&
                        col.attributes.editor === "email" && (
                            <>
                                <MenuItem
                                    key={0}
                                    onClick={handleOpenGenerateMailList}
                                >
                                    <ListItemIcon>
                                        <DownloadingIcon />
                                    </ListItemIcon>
                                    <ListItemText>
                                        Mailing-Liste generieren
                                    </ListItemText>
                                </MenuItem>
                                <GenerateMailListDialog
                                    open={anchorEL_GenerateMailList != null}
                                    onClose={handleCloseGenerateMailList}
                                />
                            </>
                        )}

                    <ColumnToClipboard
                        colInfo={col}
                        headerRendererProps={props}
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

                    <MenuItem onClick={() => {}}>
                        <ListItemText>Eigenschaften</ListItemText>
                    </MenuItem>

                    <MenuItem
                        onClick={handleDeleteColumn}
                        sx={{ color: theme.palette.warning.main }}
                    >
                        <ListItemText>Löschen</ListItemText>
                    </MenuItem>
                    {foreignTable && (
                        <AddLookupModal
                            open={anchorEL_LookupModal != null}
                            onClose={handleCloseLookupModal}
                            onAddLookupModal={handleAddLookup}
                            foreignTable={foreignTable}
                        />
                    )}
                </Menu>
            </Box>

            <SearchBar />
        </Stack>
    )
}

export const headerRenderer = (props: HeaderRendererProps<Row>) => (
    <HeaderRenderer {...props} />
)
