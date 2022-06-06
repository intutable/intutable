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

import { ColumnInfo } from "@intutable/lazy-views/dist/types"
import { SimpleFilter, FILTER_OPERATORS } from "@backend/condition"
import { isInternalColumn } from "api/utils/parse/column"
import { useTable } from "hooks/useTable"
import { useView } from "hooks/useView"

// TEMP
type ColumnStub = {
    id: number
    parentColumnId: number
    joinId: number | null
    name: string
}
const prepareColumn = (column: ColumnInfo): ColumnStub => ({
    id: column.id,
    parentColumnId: column.parentColumnId,
    joinId: column.joinId,
    name: column.attributes.displayName!
})
const prepareColumns = (columns: ColumnInfo[]): ColumnStub[] => 
    columns.filter(c => !isInternalColumn(c)).map(prepareColumn)


/**
 * Button to open the filter editor
 */
export const EditFilters: React.FC = () => {

    const { data: tableData } = useTable()
    const { data: viewData, updateFilters, mutate } = useView()
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

    const handleUpdateFilters = updateFilters

    if (!tableData || !viewData) return null

    return (
        <>
            <Button startIcon={<FilterListIcon />} onClick={toggleEditor}>
                Filter
            </Button>
            <Popper open={anchorEl != null} anchorEl={anchorEl}>
                <FilterEditor
                    columns={prepareColumns(tableData.metadata.columns)}
                    activeFilters={viewData.filters as SimpleFilter[]}
                    onHandleCloseEditor={handleCloseEditor}
                    onUpdateFilters={handleUpdateFilters} />
            </Popper>
        </>
    )
}

type FilterEditorProps = {
    /** The columns to choose the left operand from. */
    columns: ColumnStub[]
    /**
     * The real filters currently limiting the displayed data. The actual
     * set of individual filter editors is computed from this plus some
     * "in progress" condition editors.
     */
    activeFilters: SimpleFilter[]
    onHandleCloseEditor: () => void
    /**
     * While the user edits the filters through a set of input components,
     * we do not want every change immediately being sent to the server.
     * When a change should be committed, the condition editor in question
     * will call a function that updates the filters on the current view.
     */
    onUpdateFilters: (newFilters: SimpleFilter[]) => Promise<void>
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

    const handleCommitFilter = async (
        index: number,
        newFilter: SimpleFilter
    ): Promise<void> => {
        if (!filters) return
        const filterCopy = [...filters]
        filterCopy[index] = newFilter
        const newFilters = filterCopy.filter(f => f !== null) as SimpleFilter[]
        return props.onUpdateFilters(newFilters)
    }

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
                            columns={props.columns}
                            filter={f}
                            onCommitFilter={f => handleCommitFilter(i, f)}
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

/** 
 * An editor component for one single filter. The total filter consists
 * of the logical conjunction of these.
 */
type SingleFilterProps = {
    /** When the user clicks "create new filter", a new filter with no data
     * in any of the input fields is generated. It is simply represented by
     * an initial setting of `null` for {@link filter}.
     */
    filter: SimpleFilter | null
    /** TEMP TableColumn is currently not usable for this task. */
    columns: ColumnStub[]
    /**
     * When the data have been sufficiently set (plus a timer to avoid
     * excessive updates), the editor calls its `onCommitFilter` prop, asking
     * the parent component to commit the current filter to the back-end.
     */
    onCommitFilter: (newFilter: SimpleFilter) => Promise<void>
}
/**
 * A single, basic filter of the form <column> <operator> <value>.
 */
const SingleFilter: React.FC<SingleFilterProps> = props => {
    const filter = props.filter

    const theme = useTheme()

    const [column, setColumn] = useState<number | string>(
        filter?.left.parentColumnId || ""
    )
    const [operator, setOperator] = useState<string>(
        filter?.operator || FILTER_OPERATORS[0].raw
    )
    const [value, setValue] = useState<string>(filter?.right.toString() || "")
    const tryCommit = () => {}

    const commit = () => {
        const leftColumn = props.columns.find(c => c.id === column)!
        const columnSpec = {
            parentColumnId: leftColumn.id,
            joinId: null,
        }
        const newFilter: SimpleFilter = {
                left: columnSpec,
                operator: operator,
                right: (operator === "LIKE" ? "%" + value + "%" : value)
        }
        return props.onCommitFilter(newFilter)
    }

    return (
        <Box sx={{
            margin: "2px",
            padding: "4px",
            bgcolor: theme.palette.action.selected,
            borderRadius: "4px",
        }}>
            <Select value={column}
                onChange={(e) => {
                    setColumn(e.target.value);
                    tryCommit()
                }
                }>
                {props.columns.map(c => (
                    <MenuItem key={c.id} value={c.id}>
                        {c.name}
                    </MenuItem>
                ))}
            </Select>
            <Select value={operator}
                onChange={(e) => {
                    setOperator(e.target.value);
                    tryCommit()
                }
                }>
                {FILTER_OPERATORS.map(op => (
                    <MenuItem key={op.raw} value={op.raw}>
                        {op.pretty}
                    </MenuItem>
                ))}
            </Select>
            <TextField variant="filled"
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    tryCommit()
                }}
            >

            </TextField>
            <IconButton sx={{ verticalAlign: "revert" }}
                        onClick={() => commit()}>
                <AddBoxIcon />
            </IconButton>
            <IconButton sx={{ verticalAlign: "revert" }}>
                <DeleteIcon />
            </IconButton>
        </Box>
    )
}
