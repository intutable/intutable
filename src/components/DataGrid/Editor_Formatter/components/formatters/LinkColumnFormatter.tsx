import { Formatter } from "@datagrid/Editor_Formatter/types/Formatter"
import { getId } from "@intutable/lazy-views/dist/selectable"
import {
    JoinDescriptor,
    ViewDescriptor,
} from "@intutable/lazy-views/dist/types"
import ClearIcon from "@mui/icons-material/Clear"
import LoadingButton from "@mui/lab/LoadingButton"
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Stack,
    Tooltip,
    useTheme,
} from "@mui/material"
import { fetcher } from "api"
import { useUser } from "auth"
import { useColumn } from "hooks/useColumn"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { useTable } from "hooks/useTable"
import { useSnackbar } from "notistack"
import React, { useEffect, useState } from "react"
import useSWR from "swr"
import { Row, TableData } from "types"

type RowPickerProps = {
    rowId: number
    joinId: JoinDescriptor["id"]
    foreignTableId: ViewDescriptor["id"]
    open: boolean
    onClose: () => void
}

type RowPreview = {
    id: number
    text: string
}

const RowPicker: React.FC<RowPickerProps> = props => {
    const { user } = useUser()
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    const { data: baseTableData, mutate } = useTable()
    const { getRowId } = useRow()

    const { data: linkTableData, error } = useSWR<TableData>(
        user
            ? { url: `/api/table/${props.foreignTableId}`, method: "GET" }
            : null
    )

    const [options, setOptions] = useState<RowPreview[]>([])
    const [selection, setSelection] = useState<RowPreview | null>(null)

    // get data from target table and generate previews for rows
    useEffect(() => {
        if (!linkTableData) {
            setOptions([])
        } else {
            const tableInfo = linkTableData!.metadata
            const primaryColumn = tableInfo.columns.find(
                c => c.attributes.userPrimary! === 1
            )!
            setOptions(
                linkTableData!.rows.map(r => ({
                    id: getRowId(linkTableData, r),
                    text: r[primaryColumn.key] as string,
                }))
            )
        }
    }, [getRowId, linkTableData])

    const handlePickRow = async () => {
        try {
            await fetcher({
                url: `/api/join/${props.joinId}`,
                body: {
                    viewId: baseTableData!.metadata.descriptor.id,
                    rowId: props.rowId,
                    value: selection?.id,
                },
            })
            await mutate()
        } catch (err) {
            enqueueSnackbar("Die Zeile konnte nicht hinzugefügt werden!", {
                variant: "error",
            })
        } finally {
            props.onClose()
        }
    }

    return (
        <Dialog open={props.open} onClose={() => props.onClose()}>
            <DialogTitle>Wähle eine Zeile</DialogTitle>
            <DialogContent>
                {linkTableData == null && error == null ? (
                    <CircularProgress />
                ) : error ? (
                    <>Error: {error}</>
                ) : (
                    <>
                        <List>
                            {options
                                .filter(row => row.text != null)
                                .map(row => (
                                    <ListItem
                                        key={row.id}
                                        disablePadding
                                        sx={{
                                            bgcolor:
                                                selection?.id === row.id
                                                    ? theme.palette.action
                                                          .selected
                                                    : undefined,
                                        }}
                                    >
                                        <ListItemButton
                                            onClick={() => setSelection(row)}
                                        >
                                            <ListItemText primary={row.text} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                        </List>
                    </>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={() => props.onClose()}>Abbrechen</Button>
                <LoadingButton
                    loading={linkTableData?.rows == null && error == null}
                    loadingIndicator="Lädt..."
                    onClick={handlePickRow}
                    disabled={selection == null || error}
                >
                    Hinzufügen
                </LoadingButton>
            </DialogActions>
        </Dialog>
    )
}

export const LinkColumnFormatter: Formatter = props => {
    const { row, column } = props
    const { snackError } = useSnacki()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const handleOpenModal = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        event.preventDefault()
        setAnchorEL(event.currentTarget)
    }
    const handleCloseModal = () => setAnchorEL(null)

    const { data, mutate } = useTable()
    const { getColumnByKey } = useColumn()
    const { getRowId } = useRow()

    const [foreignTableId, setForeignTableId] = useState<ViewDescriptor["id"]>()
    const [joinId, setJoinId] = useState<JoinDescriptor["id"]>()

    useEffect(() => {
        const metaColumn = getColumnByKey(column.key)
        const join = data!.metadata.joins.find(j => j.id === metaColumn.joinId)!
        setJoinId(join.id)
        setForeignTableId(getId(join.foreignSource))
    }, [data, column.key, getColumnByKey])

    const key = column.key as keyof Row
    const content = row[key] as string | null | undefined
    const hasContent = content && content.length > 0

    const [deleteIconVisible, setDeleteIconVisible] = useState<boolean>(false)
    const handleDeleteContent = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        try {
            e.stopPropagation()
            await fetcher({
                url: `/api/join/${joinId}`,
                body: {
                    viewId: data!.metadata.descriptor.id,
                    rowId: getRowId(data, row),
                    value: null,
                },
            })
            await mutate()
        } catch (error) {
            snackError("Der Inhalt konnte nicht gelöscht werden")
        }
    }

    return (
        <>
            <Tooltip
                enterDelay={1000}
                arrow
                title={`Lookup ${hasContent ? "ändern" : "hinzufügen"}`}
            >
                <Box
                    onMouseOver={() => setDeleteIconVisible(true)}
                    onMouseOut={() => setDeleteIconVisible(false)}
                    onClick={handleOpenModal}
                    sx={{
                        width: "100%",
                        height: "100%",
                        cursor: "cell",
                    }}
                >
                    <Stack direction="row">
                        <Box flexGrow="1">{content}</Box>
                        {deleteIconVisible && hasContent && (
                            <Box>
                                <IconButton
                                    size="small"
                                    onClick={handleDeleteContent}
                                >
                                    <ClearIcon fontSize="inherit" />
                                </IconButton>
                            </Box>
                        )}
                    </Stack>
                </Box>
            </Tooltip>
            {foreignTableId && joinId && (
                <RowPicker
                    rowId={getRowId(data, row)}
                    joinId={joinId}
                    foreignTableId={foreignTableId}
                    open={anchorEL != null}
                    onClose={handleCloseModal}
                />
            )}
        </>
    )
}
