import { FormatterComponent } from "@datagrid/Formatter"
import { getId } from "@intutable/lazy-views/dist/selectable"
import {
    JoinDescriptor,
    ViewDescriptor,
} from "@intutable/lazy-views/dist/types"
import { Box, Stack, Tooltip } from "@mui/material"
import { fetcher } from "api"
import { useAPI } from "context"
import { getColumnInfo } from "hooks/useColumn"
import { getRowId } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { useTable } from "hooks/useTable"
import { useTables } from "hooks/useTables"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Row } from "types"
import { DeleteButton } from "../components/DeleteButton"
import { RowSelector } from "../components/RowSelector"

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
    const { project } = useAPI()
    const { tables } = useTables(project)

    const metaColumn = useMemo(
        () => (data ? getColumnInfo(data.metadata.columns, column) : null),
        [column, data]
    )

    const join = useMemo(() => {
        if (metaColumn == null) return null
        return data!.metadata.joins.find(j => j.id === metaColumn!.joinId)!
    }, [data, metaColumn])

    const foreignTable = useMemo(() => {
        if (join == null || tables == null) return
        return tables.find(tbl => tbl.id === getId(join.foreignSource))!
    }, [join, tables])

    const key = column.key as keyof Row
    const content = row[key] as string | null | undefined
    const hasContent = content && content.length > 0

    const [deleteIconVisible, setDeleteIconVisible] = useState<boolean>(false)

    const handleDeleteContent = useCallback(
        async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            try {
                event.stopPropagation()
                await fetcher({
                    url: `/api/join/${join}`,
                    body: {
                        viewId: data!.metadata.descriptor.id,
                        rowId: getRowId(data, row),
                        value: null,
                    },
                })
                await mutate() // TODO: handle mutation differently
            } catch (error) {
                snackError("Der Inhalt konnte nicht gelöscht werden")
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [data, join, mutate, row]
    )

    if (join == null || foreignTable == null) return null

    return (
        <>
            <Tooltip
                enterDelay={1000}
                arrow
                title={`Link ${hasContent ? "ändern" : "hinzufügen"}`}
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
            <RowSelector
                rowId={getRowId(data, row)}
                join={join}
                foreignTable={foreignTable}
                open={anchorEL != null}
                onClose={handleCloseModal}
            />
        </>
    )
}

export const LinkColumnFormatter = React.memo(_LinkColumnFormatter)
