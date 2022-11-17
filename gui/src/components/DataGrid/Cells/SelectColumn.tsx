import { jsx } from "@emotion/react"
import { Box, IconButton, Stack } from "@mui/material"
import { useState } from "react"
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    SelectColumn as OriginalSelectColumm,
    SELECT_COLUMN_KEY,
    SelectCellFormatter,
    useRowSelection,
} from "react-data-grid"
import OpenInFullIcon from "@mui/icons-material/OpenInFull"
import { MetaColumnProps, Row } from "types"
import { Column } from "types/tables/rdg"
import { useRowMask } from "context/RowMaskContext"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SelectFormatter = (props: { isCellSelected: any; row: any }) => {
    const { setRowMaskState } = useRowMask()
    const [isRowSelected, onRowSelectionChange] = useRowSelection()

    const [isHovering, setIsHovering] = useState<boolean>(false)

    const expandRow = () => {
        setRowMaskState({
            mode: "edit",
            row: props.row as Row,
        })
    }

    return (
        <Box
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            sx={{ height: 1, width: 1 }}
        >
            {isHovering || isRowSelected ? (
                <Stack
                    direction="row"
                    sx={{
                        alignItems: "center",
                        height: 1,
                        width: 1,
                        ".rdg-checkbox-label": {
                            position: "static",
                        },
                    }}
                >
                    {jsx(SelectCellFormatter, {
                        "aria-label": "Select",
                        isCellSelected: props.isCellSelected,
                        value: isRowSelected,
                        onChange: (checked, isShiftClick) => {
                            onRowSelectionChange({
                                row: props.row,
                                checked,
                                isShiftClick,
                            })
                        },
                    })}
                    {isHovering && (
                        <IconButton
                            onClick={expandRow}
                            size="small"
                            color="primary"
                        >
                            <OpenInFullIcon fontSize="small" />
                        </IconButton>
                    )}
                </Stack>
            ) : (
                (props.row as Row).index
            )}
        </Box>
    )
}

/**
 * Derived from {@link OriginalSelectColumm}
 */
const _SelectColumn: Omit<Column, keyof MetaColumnProps> = {
    key: SELECT_COLUMN_KEY,
    name: "",
    width: 70,
    minWidth: 70,
    maxWidth: 70,
    resizable: false,
    sortable: false,
    frozen: true,

    headerRenderer(props) {
        return /*#__PURE__*/ jsx(SelectCellFormatter, {
            "aria-label": "Select All",
            isCellSelected: props.isCellSelected,
            value: props.allRowsSelected,
            onChange: props.onAllRowsSelectionChange,
        })
    },

    formatter: SelectFormatter,
}

export const SelectColumn = _SelectColumn as Column
