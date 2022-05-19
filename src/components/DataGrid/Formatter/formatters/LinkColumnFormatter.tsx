import { FormatterComponent } from "@datagrid/Formatter"
import { getId } from "@intutable/lazy-views/dist/selectable"
import {
    JoinDescriptor,
    ViewDescriptor,
} from "@intutable/lazy-views/dist/types"
import ClearIcon from "@mui/icons-material/Clear"
import { Box, IconButton, Stack, Tooltip } from "@mui/material"
import { fetcher } from "api"
import { getColumnInfo } from "hooks/useColumn"
import { getRowId } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { useTable } from "hooks/useTable"
import React, { useEffect, useState } from "react"
import { Row } from "types"
import { DeleteButton } from "../components/DeleteButton"
import { RowPicker } from "../components/RowPicker"

const _LinkColumnFormatter: FormatterComponent = props => {
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

    const [foreignTableId, setForeignTableId] = useState<ViewDescriptor["id"]>()
    const [joinId, setJoinId] = useState<JoinDescriptor["id"]>()

    /**
     * // BUG This component renders 1. too often and 2. and every hover etc.
     * It needs to be fast, performant and memoized in order to work properly.
     *
     * It could be related with the issue of not re-rendering the page
     *
     * possible approach:
     *
     * first simplify the core/plugin type structure,
     * those calculations then may be obsolete and can be
     * set statically
     *
     * further more clean up and memoize e.g.
     *
     *
     */
    useEffect(() => {
        if (data == null) return
        const metaColumn = getColumnInfo(data.metadata.columns, column)
        const join = data!.metadata.joins.find(j => j.id === metaColumn.joinId)!
        setJoinId(join.id)
        setForeignTableId(getId(join.foreignSource))
    }, [column, data])

    const key = column.key as keyof Row
    const content = row[key] as string | null | undefined
    const hasContent = content && content.length > 0

    const [deleteIconVisible, setDeleteIconVisible] = useState<boolean>(false)

    const handleDeleteContent = async (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        try {
            event.stopPropagation()
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
                            <DeleteButton onDelete={handleDeleteContent} />
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

export const LinkColumnFormatter = React.memo(_LinkColumnFormatter)
