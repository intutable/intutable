import { useAuth, useTableCtx } from "context"
import { useSnackbar } from "notistack"
import React, { useEffect, useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import LoadingButton from "@mui/lab/LoadingButton"
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Tooltip,
    useTheme,
} from "@mui/material"

import { JtDescriptor, JoinDescriptor } from "@intutable/join-tables/dist/types"

import { TableData } from "types"
import { Formatter } from "@datagrid/Editor_Formatter/types/Formatter"
import { fetchWithUser } from "api"

type RowPickerProps = {
    rowId: number
    joinId: JoinDescriptor["id"]
    foreignTableId: JtDescriptor["id"]
    open: boolean
    onClose: () => void
}

type RowPreview = {
    id: number
    text: string
}

const RowPicker: React.FC<RowPickerProps> = props => {
    const { user } = useAuth()
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    const { data: baseTableData, utils } = useTableCtx()

    const { data: linkTableData, error } = useSWR<TableData>(
        user
            ? [`/api/table/${props.foreignTableId}`, user, undefined, "GET"]
            : null,
        fetchWithUser
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
                    id: utils.getRowId(linkTableData, r),
                    text: r[primaryColumn.key] as string,
                }))
            )
        }
    }, [linkTableData, utils])

    const handlePickRow = async () => {
        try {
            await fetchWithUser(
                `/api/join/${props.joinId}`,
                user!,
                {
                    jtId: baseTableData!.metadata.descriptor.id,
                    rowId: props.rowId,
                    value: selection?.id,
                },
                "POST"
            )
            await utils.mutate()
        } catch (err) {
            enqueueSnackbar("Die X konnte nicht hinzugefügt werden!", {
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
                            {options.map(row => (
                                <ListItem
                                    key={row.id}
                                    disablePadding
                                    sx={{
                                        bgcolor:
                                            selection?.id === row.id
                                                ? theme.palette.action.selected
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

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const handleOpenModal = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        event.preventDefault()
        setAnchorEL(event.currentTarget)
    }

    const handleCloseModal = () => setAnchorEL(null)

    const { data, utils } = useTableCtx()

    const [foreignTableId, setForeignTableId] = useState<JtDescriptor["id"]>(-1)
    const [joinId, setJoinId] = useState<JoinDescriptor["id"]>(-1)

    useEffect(() => {
        const metaColumn = utils.getColumnByKey(column.key)
        const join = data!.metadata.joins.find(j => j.id === metaColumn.joinId)!
        setJoinId(join.id)
        setForeignTableId(join.foreignJtId)
    }, [data, utils, column.key])

    return (
        <>
            {row[column.key]}
            <Tooltip enterDelay={1000} arrow title="Lookup-Feld hinzufügen">
                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        cursor: "cell",
                    }}
                    onClick={handleOpenModal}
                ></Box>
            </Tooltip>
            <RowPicker
                rowId={utils.getRowId(data, row)}
                joinId={joinId}
                foreignTableId={foreignTableId}
                open={anchorEL != null}
                onClose={handleCloseModal}
            />
        </>
    )
}
