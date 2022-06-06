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

    if (!tableData || !viewData) return null

    return (
        <>
            <Button startIcon={<FilterListIcon />} onClick={toggleEditor}>
                Filter
            </Button>
            <Popper open={anchorEl != null} anchorEl={anchorEl}>
                <FilterEditor
                    columns={tableData.columns}
                    activeFilters={viewData.filters as SimpleFilter[]}
                    onHandleCloseEditor={handleCloseEditor}/>
            </Popper>
        </>
    )
}

type FilterEditorProps = {
    columns: TableColumn[]
    activeFilters: SimpleFilter[]
    onHandleCloseEditor: () => void
}

const FilterEditor: React.FC<FilterEditorProps> = props => {

    const [filters, setFilters] = useState<(SimpleFilter | null)[]>([])

    useEffect(() => {
        // The GUI components created when you click "add" are not yet ready
        // to create a filter from, so we just keep these as null.
        if (props.activeFilters.length > 0)
            setFilters(props.activeFilters)
        else
            setFilters([null])
    }, [props.activeFilters])

    const handleAddFilter = () => setFilters(prev => prev.concat(null))

    return (
        <>
            <Paper elevation={2} sx={{ padding: "16px" }}>
                <Stack>
                    <Box>
                        <IconButton
                            onClick={props.onHandleCloseEditor}
                            sx={{
                                float: "right",
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    {filters && filters.map((f, i) =>
                        <SingleFilter
                            key={i}
                            columns={props.columns.filter(
                                c => !isAppColumn(c))}
                            filter={f}
                        />
                    )}
                    <IconButton
                        onClick={handleAddFilter}
                        sx={{
                            borderRadius: "4px",
                        }}
                    >
                        <AddBoxIcon />
                    </IconButton>
                </Stack>
            </Paper>
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
