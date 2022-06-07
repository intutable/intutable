import React, { useState, useEffect } from "react"
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
import { useSnacki } from "hooks/useSnacki"
import { makeError } from "utils/error-handling/utils/makeError"

type WipFilter = Partial<SimpleFilter>

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
    name: column.attributes.displayName!,
})
const prepareColumns = (columns: ColumnInfo[]): ColumnStub[] =>
    columns.filter(c => !isInternalColumn(c)).map(prepareColumn)

/**
 * Button to open the filter editor
 */
export const EditFilters: React.FC = () => {
    const { data: tableData } = useTable()
    const { data: viewData, updateFilters } = useView()
    const [anchorEl, setAnchorEl] = useState<Element | null>(null)
    const { snackInfo, snackError } = useSnacki()

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

    const handleUpdateFilters = async (
        newFilters: SimpleFilter[]
    ): Promise<void> => {
        try {
            await updateFilters(newFilters)
        } catch (error) {
            const err = makeError(error)
            if (err.message === "changeDefaultView")
                snackInfo("Standardsicht kann nicht geändert werden.")
            else snackError("Filter erstellen fehlgeschlagen.")
        }
    }

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
                    onUpdateFilters={handleUpdateFilters}
                />
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

    /** 
     * We want the user to be able to save and apply filters without the
     * incomplete ones they are also editing to be deleted on each re-render.
     * To this end, we keep a list of "WIP filters", where all incomplete
     * filters are stored directly in the array, and the real, back-end
     * filters are simply nulls that will be populated on render.
     * INVARIANT: the number of nulls in `wipFilters` <= number of
     * elements in `props.activeFilters`
     */
    const [wipFilters, setWipFilters] = useState<(WipFilter | null)[]>(
        props.activeFilters.length > 0
            ? new Array(props.activeFilters.length).fill(null)
            : [newEmptyWipFilter()]
    )
    const [filters, setFilters] = useState<WipFilter[]>([])

    /**
     * Merge {@link wipFilters} with the active filters from the back-end
     * to get the currently-displayed filter list.
     */
    useEffect(() => {
        if (!props.activeFilters || !wipFilters) return
        const displayFilters = new Array(wipFilters.length)
        for(let aI = 0, wI = 0; wI < wipFilters.length; wI++){
            if (wipFilters[wI] === null){
                displayFilters[wI] = props.activeFilters[aI]
                aI++
            } else {
                displayFilters[wI] = wipFilters[wI]
            }
        }
        setFilters(displayFilters)
    }, [props.activeFilters, wipFilters])

    const handleAddFilter = () => setWipFilters(
        prev => prev.concat(newEmptyWipFilter())
    )

    /**
       Righto, uh. if it's a WIP filter, easy going. If not... we need
       the right index... oh lawd.
     */
    const handleDeleteFilter = async (index: number): Promise<void> => {
        if (!filters) return
        // if it's a WIP filter, just delete that
        setWipFilters(prev => arrayRemove(prev, index))

        // find index within the active filters:
        const aIndex = wipFilters
            .slice(0, index + 1)
            .filter(f => f === null)
            .length
            - 1
        const newFilters = arrayRemove(props.activeFilters, aIndex)
        return props.onUpdateFilters(newFilters)
    }

    const handleCommitFilter = async (
        index: number,
        newFilter: SimpleFilter
    ): Promise<void> => {
        if (!filters) return
        const filterCopy = [...filters]
        filterCopy[index] = newFilter
        const newFilters = filterCopy.filter(isValidFilter) as SimpleFilter[]
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
                    {filters &&
                        filters.map((f, i) => (
                            <SingleFilter
                                key={i}
                                columns={props.columns}
                                filter={f}
                                onHandleDelete={() => handleDeleteFilter(i)}
                                onCommitFilter={f => handleCommitFilter(i, f)}
                            />
                        ))}
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
     * in any of the input fields is generated. Also, a filter may have some
     * of its fields set, but not enough to send to the back-end yet, so we
     * can't just represent it with `null` or something.
     */
    filter: WipFilter
    /** TEMP TableColumn is currently not usable for this task. */
    columns: ColumnStub[]
    onHandleDelete: () => Promise<void>
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
        filter.left?.parentColumnId || ""
    )
    const [operator, setOperator] = useState<string>(
        filter.operator || FILTER_OPERATORS[0].raw
    )
    const [value, setValue] = useState<string>(filter.right?.toString() || "")

    useEffect(() => {
        setColumn(filter.left?.parentColumnId || "")
        setOperator(filter.operator || FILTER_OPERATORS[0].raw)
        setValue(filter.right?.toString() || "")
    }, [props.filter])

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
            right: operator === "LIKE" ? "%" + value + "%" : value,
        }
        return props.onCommitFilter(newFilter)
    }

    return (
        <Box
            sx={{
                margin: "2px",
                padding: "4px",
                bgcolor: theme.palette.action.selected,
                borderRadius: "4px",
            }}
        >
            <Select
                value={column}
                onChange={e => {
                    setColumn(e.target.value)
                    tryCommit()
                }}
            >
                {props.columns.map(c => (
                    <MenuItem key={c.id} value={c.id}>
                        {c.name}
                    </MenuItem>
                ))}
            </Select>
            <Select
                value={operator}
                onChange={e => {
                    setOperator(e.target.value)
                    tryCommit()
                }}
            >
                {FILTER_OPERATORS.map(op => (
                    <MenuItem key={op.raw} value={op.raw}>
                        {op.pretty}
                    </MenuItem>
                ))}
            </Select>
            <TextField
                variant="filled"
                value={value}
                onChange={e => {
                    setValue(e.target.value)
                    tryCommit()
                }}
            ></TextField>
            <IconButton
                sx={{ verticalAlign: "revert" }}
                onClick={() => commit()}
            >
                <AddBoxIcon />
            </IconButton>
            <IconButton
                sx={{ verticalAlign: "revert" }}
                onClick={props.onHandleDelete}
            >
                <DeleteIcon />
            </IconButton>
        </Box>
    )
}

const newEmptyWipFilter = (): WipFilter => ({
    operator: FILTER_OPERATORS[0].raw,
})

const isValidFilter = (filter: WipFilter): filter is SimpleFilter =>
    filter.left !== undefined &&
    filter.operator !== undefined &&
    filter.right !== undefined

const arrayRemove = <A,>(a: Array<A>, i: number): Array<A> =>
    a.slice(0, i).concat(...a.slice(i + 1))
