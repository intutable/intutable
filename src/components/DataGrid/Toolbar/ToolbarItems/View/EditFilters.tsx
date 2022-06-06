import React, { useState, useMemo, useEffect } from "react"
import FilterListIcon from "@mui/icons-material/FilterList"
import CloseIcon from "@mui/icons-material/Close"
import DeleteIcon from "@mui/icons-material/Delete"
import AddBoxIcon from "@mui/icons-material/AddBox"
import {
    useTheme,
    Button,
    Popper,
    Paper,
    Select,
    MenuItem,
    TextField,
    IconButton,
    Stack,
    Box,
} from "@mui/material"

import { TableColumn } from "types/rdg"
import { SimpleFilter, FILTER_OPERATORS } from "@backend/condition"
import { isAppColumn } from "api/utils/de_serialize/column"
import { useTable } from "hooks/useTable"
import { useView } from "hooks/useView"

/**
 * Button to open the filter editor
 */
export const EditFilters: React.FC = () => {

    const { data: tableData } = useTable()
    const { data: viewData } = useView()
    const [anchorEl, setAnchorEl] = useState<Element | null>(null)

    const filters = useMemo(() => {
        if (!tableData || !viewData) return

        // The GUI components created when you click "add" are not yet ready
        // to create a filter from, so we just keep these as null.
        if (viewData.filters.length > 0)
            return viewData.filters as SimpleFilter[]
        else
            return [null]
    }, [tableData, viewData])

    /* const [filters, setFilters] = useState<(SimpleFilter | null)[] | undefined>(
*     initialFilters)

* if (!filters) return null */

    const handleOpenEditor = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        setAnchorEl(event.currentTarget)
    }
    const handleCloseEditor = () => setAnchorEl(null)
    const toggleEditor = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        if (anchorEl) handleCloseEditor()
        else handleOpenEditor(event)
    }

    const handleAddFilter = () => {
        //setFilters(prev => prev!.concat(null))
    }
    return (
        <>
            <Button startIcon={<FilterListIcon />} onClick={toggleEditor}>
                Filter
            </Button>
            <Popper open={anchorEl != null} anchorEl={anchorEl}>
                <Paper elevation={2} sx={{ padding: "16px" }}>
                    <Stack>
                        <Box>
                            <IconButton
                                onClick={handleCloseEditor}
                                sx={{
                                    float: "right",
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        {tableData && filters && filters.map((f, i) =>
                            <SingleFilter
                                columns={tableData.columns.filter(
                                    c => !isAppColumn(c))}
                                filter={f}
                            />
                        )}
                        <IconButton onClick={handleAddFilter}>
                            <AddBoxIcon />
                        </IconButton>
                    </Stack>
                </Paper>
            </Popper>
        </>
    )
}


type SingleFilterProps = {
    filter: SimpleFilter | null
    columns: TableColumn[]
}
/**
 * A single, basic filter of the form <column> <operator> <value>.
 */
const SingleFilter: React.FC<SingleFilterProps> = props => {

    const filter = props.filter

    const theme = useTheme()

    return (
        <Box sx={{
            margin: "2px",
            padding: "4px",
            bgcolor: theme.palette.action.selected,
            borderRadius: "4px",
        }}>
            <Select value={filter?.left.parentColumnId || ""}>
                {props.columns.map(c => (
                    <MenuItem key={c._id} value={c._id}>
                        {c.name}
                    </MenuItem>
                ))}
            </Select>
            <Select value={filter?.operator || FILTER_OPERATORS[0].raw }>
                {FILTER_OPERATORS.map(op => (
                    <MenuItem key={op.raw} value={op.raw}>
                        {op.pretty}
                    </MenuItem>
                ))}
            </Select>
            <TextField variant="filled"
                       value={filter?.right || ""}
            ></TextField>
            <IconButton sx={{ verticalAlign: "revert" }}>
                <DeleteIcon />
            </IconButton>
        </Box>
    )
}
