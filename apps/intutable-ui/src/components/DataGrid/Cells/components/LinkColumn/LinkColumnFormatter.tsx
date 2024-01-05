import { FormatterComponent } from "@datagrid/Cells/types/FormatterComponent"
import { Box, Stack, Tooltip } from "@mui/material"
import { useSnacki } from "hooks/useSnacki"
import { useTable } from "hooks/useTable"
import { useView } from "hooks/useView"
import { useForeignTable } from "hooks/useForeignTable"
import { useLink } from "hooks/useLink"
import React, { useCallback, useState } from "react"
import { Row } from "types"
import { DeleteButton } from "./DeleteButton"
import { RowSelector } from "./RowSelector"

/**
 * @deprecated
 *
 * This formatter is no usual cell component
 * but a meta wrapper
 *
 * This should be refactored in a much simpler way
 */

const _LinkColumnFormatter: FormatterComponent = props => {
    const { row, column } = props
    const { snackError } = useSnacki()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const handleOpenModal = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.preventDefault()
        setAnchorEL(event.currentTarget)
    }
    const handleCloseModal = () => setAnchorEL(null)

    const { mutate: mutateTable } = useTable()
    const { mutate: mutateView } = useView()

    const { foreignTable } = useForeignTable(column)
    const { setLinkValue } = useLink(column)

    const key = column.key as keyof Row
    const content = row[key] as string | null | undefined
    const hasContent = content && content.length > 0

    const [deleteIconVisible, setDeleteIconVisible] = useState<boolean>(false)

    const handleDeleteContent = useCallback(
        async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            try {
                event.stopPropagation()
                await setLinkValue(row, null)
                await mutateTable()
                await mutateView()
            } catch (error) {
                snackError("Der Inhalt konnte nicht gelöscht werden")
            }
        },
        [mutateTable, mutateView, setLinkValue, row, snackError]
    )

    if (foreignTable == null) return null

    return (
        <>
            <Tooltip enterDelay={1000} arrow title={`Link ${hasContent ? "ändern" : "hinzufügen"}`}>
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
                row={row}
                foreignTable={foreignTable}
                open={anchorEL != null}
                onClose={handleCloseModal}
                column={props.column} // TODO: instead use the foreign column
            />
        </>
    )
}

export const LinkColumnFormatter = React.memo(_LinkColumnFormatter)
export default LinkColumnFormatter
