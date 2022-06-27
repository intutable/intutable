/**
 * TODO: find a good place for isValidFilter, decide which component should
 * be deciding when to commit.
 * give singlefilter only one commit function, let parent component decide if
 * it's valid or not.
 */
import React, { useState, useEffect, useCallback, useRef } from "react"
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
    Typography,
} from "@mui/material"

import { ViewDescriptor } from "@intutable/lazy-views/dist/types"
import { SimpleFilter, FILTER_OPERATORS } from "@backend/condition"
import { defaultViewName } from "@backend/defaults"
import { TableColumn } from "types/rdg"
import { ColumnUtility } from "components/Data Grid/CellType/ColumnUtility"
import { useAPI } from "context/APIContext"
import { useTable } from "hooks/useTable"
import { useView } from "hooks/useView"
import { useSnacki } from "hooks/useSnacki"
import { makeError } from "utils/error-handling/utils/makeError"

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
            <Button
                startIcon={<FilterListIcon />}
                onClick={toggleEditor}
                disabled={viewData.descriptor.name === defaultViewName()}
            >
                Filter
            </Button>
            <FilterEditor
                anchorEl={anchorEl}
                columns={tableData.columns.filter(
                    c => !ColumnUtility.isAppColumn(c)
                )}
                activeFilters={viewData.filters as SimpleFilter[]}
                onHandleCloseEditor={handleCloseEditor}
                onUpdateFilters={handleUpdateFilters}
            />
        </>
    )
}

type FilterEditorProps = {
    anchorEl: Element | null
    /** The columns to choose the left operand from. */
    columns: TableColumn[]
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

type WipFilter = Partial<SimpleFilter>

/**
 * We want the user to be able to save and apply filters without the
 * incomplete ones they are also editing to be deleted on each re-render.
 * To this end, we keep a list of "WIP filters" that stores filters which
 * cannot be committed to the view yet. If the view's "active" filters change,
 * the new array is merged with the WIP filters.
 */
const FilterEditor: React.FC<FilterEditorProps> = props => {
    /**
     * If the view changes, our wip-nulls ~ active filters invariant
     * (see {@link wipFilters} cannot be maintained, so close the editor.
     */
    const { view } = useAPI()
    const viewRef = useRef<ViewDescriptor | null>()
    useEffect(() => {
        viewRef.current = view
    })
    const prevView = viewRef.current
    useEffect(() => {
        if (prevView && prevView.id !== view?.id) props.onHandleCloseEditor()
    }, [view, prevView, props])

    /**
     * The trick is that `wipFilters` is as long as there are filters in total,
     * and the active filters' positions are kept free with `null`.
     * important invariant: the number of nulls in `wipFilters` <= number of
     * elements in `props.activeFilters`. This is also why we close the
     * editor when the current view changes.
     */
    const [wipFilters, setWipFilters] = useState<(WipFilter | null)[]>(
        props.activeFilters.length > 0
            ? new Array(props.activeFilters.length).fill(null)
            : [newEmptyWipFilter()]
    )
    const [filters, setFilters] = useState<WipFilter[]>([])

    /**
     * Merge {@link wipFilters} with the active filters from the back-end
     * to get set of filters to display.
     */
    useEffect(() => {
        if (!props.activeFilters || !wipFilters) return

        const displayFilters = new Array(wipFilters.length)
        for (let aI = 0, wI = 0; wI < wipFilters.length; wI++) {
            if (wipFilters[wI] === null) {
                displayFilters[wI] = props.activeFilters[aI]
                aI++
            } else {
                displayFilters[wI] = wipFilters[wI]
            }
        }
        setFilters(displayFilters)
    }, [props.activeFilters, wipFilters])

    const handleAddFilter = () =>
        setWipFilters(prev => prev.concat(newEmptyWipFilter()))

    /**
     * Delete a filter - if it's a WIP filter, just remove the GUI component,
     * otherwise, we have to talk to the back-end.
     */
    const handleDeleteFilter = async (index: number): Promise<void> => {
        if (!filters) return
        // if it's a WIP filter, just delete that
        if (wipFilters[index] !== null)
            setWipFilters(prev => arrayRemove(prev, index))
        else {
            // find index within the active filters:
            const aIndex =
                wipFilters.slice(0, index + 1).filter(f => f === null).length -
                1
            setWipFilters(prev => arrayRemove(prev, index))
            const newFilters = arrayRemove(props.activeFilters, aIndex)
            return props.onUpdateFilters(newFilters)
        }
    }

    /**
     * If (e.g.) the user deletes the text of a filter's "value" field, then
     * it should be disabled, but without the GUI component being deleted
     * altogether. This callback handles that event.
     */
    const handleFilterBecomeInvalid = async (
        index: number,
        incomplete: WipFilter
    ): Promise<void> => {
        // if it was a WIP filter already, just leave it
        if (!filters) return
        if (wipFilters[index] !== null) return
        else {
            const aIndex =
                wipFilters.slice(0, index + 1).filter(f => f === null).length -
                1
            setWipFilters(prev => {
                const copy = [...prev]
                copy[index] = incomplete
                return copy
            })
            const newFilters = arrayRemove(props.activeFilters, aIndex)
            return props.onUpdateFilters(newFilters)
        }
    }

    const handleCommitFilter = async (
        index: number,
        newFilter: SimpleFilter
    ): Promise<void> => {
        if (!filters) return
        const filterCopy = [...filters]
        filterCopy[index] = newFilter
        const newFilters = filterCopy.filter(isValidFilter) as SimpleFilter[]
        await props.onUpdateFilters(newFilters)
        setWipFilters(prev => {
            const copy = [...prev]
            copy[index] = null
            return copy
        })
    }

    return (
        <Popper open={props.anchorEl != null} anchorEl={props.anchorEl}>
            <Paper elevation={2} sx={{ padding: "16px" }}>
                <Stack>
                    <Box>
                        <Typography></Typography>
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
                                onCommit={f => handleCommitFilter(i, f)}
                                onBecomeInvalid={f =>
                                    handleFilterBecomeInvalid(i, f)
                                }
                            />
                        ))}
                    <IconButton
                        onClick={handleAddFilter}
                        sx={{
                            borderRadius: "4px",
                            mt: 2,
                        }}
                    >
                        <AddBoxIcon />
                    </IconButton>
                </Stack>
            </Paper>
        </Popper>
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
    columns: TableColumn[]
    onHandleDelete: () => Promise<void>
    /**
     * When the data have been sufficiently set (plus a timer to avoid
     * excessive updates), the editor calls its `onCommitFilter` prop, asking
     * the parent component to commit the current filter to the back-end.
     */
    onCommit: (newFilter: SimpleFilter) => Promise<void>
    onBecomeInvalid: (partialFilter: WipFilter) => Promise<void>
}
/**
 * A single, basic filter of the form <column> <operator> <value>.
 */
const SingleFilter: React.FC<SingleFilterProps> = props => {
    const COMMIT_TIMEOUT = 500

    const { columns, filter, onCommit, onBecomeInvalid } = props

    const theme = useTheme()
    const [column, setColumn] = useState<number | string>(
        filter.left?.parentColumnId || ""
    )
    const [operator, setOperator] = useState<string>(
        filter.operator || FILTER_OPERATORS[0].raw
    )
    const [value, setValue] = useState<string>(filter.right?.toString() || "")
    const [readyForCommit, setReadyForCommit] = useState<boolean>(true)
    /**
     * The current state of the filter in progress. Required for our
     * dynamic updating behavior below.
     */
    const filterState = useRef<WipFilter>()

    /**
     * The filter is committed automatically as the user enters data,
     * so we set a timer to prevent excessive fetching. After the timer expires,
     * the data are re-committed one last time.
     */
    const commit = useCallback(async () => {
        setReadyForCommit(false)
        const currentFilter = filterState.current
        if (!currentFilter) return

        setTimeout(async () => {
            const newFilter = filterState.current!
            if (isValidFilter(newFilter)) await onCommit(newFilter)
            else await onBecomeInvalid(newFilter)
            setReadyForCommit(true)
        }, COMMIT_TIMEOUT)
        if (isValidFilter(currentFilter)) await onCommit(currentFilter)
        else await onBecomeInvalid(currentFilter)
    }, [onCommit, onBecomeInvalid])

    const assembleFilter = useCallback(() => {
        const leftColumn = columns.find(c => c._id === column)
        const columnSpec = leftColumn
            ? { parentColumnId: leftColumn._id, joinId: null }
            : undefined
        const newFilter: WipFilter = {
            left: columnSpec,
            operator: operator,
            right: operator === "LIKE" ? "%" + value + "%" : value,
        }
        return newFilter
    }, [column, operator, columns, value])

    /** See {@link commit} */
    useEffect(() => {
        const newFilter = assembleFilter()
        if (filterState.current && filterEquals(filterState.current, newFilter))
            return
        filterState.current = newFilter
        if (readyForCommit) commit()
    }, [column, operator, value, assembleFilter, readyForCommit, commit])

    return (
        <Box
            sx={{
                m: 0.5,
                p: 0.5,
                borderRadius: "4px",
                display: "flex",
                alignContent: "center",
            }}
        >
            <Select
                value={column}
                onChange={e => {
                    setColumn(e.target.value)
                }}
                sx={{
                    mr: 1,
                }}
                size="small"
            >
                {columns.map(c => (
                    <MenuItem key={c._id} value={c._id}>
                        {c.name}
                    </MenuItem>
                ))}
            </Select>
            <Select
                value={operator}
                onChange={e => {
                    setOperator(e.target.value)
                }}
                sx={{
                    mr: 1,
                }}
                size="small"
            >
                {FILTER_OPERATORS.map(op => (
                    <MenuItem key={op.raw} value={op.raw}>
                        {op.pretty}
                    </MenuItem>
                ))}
            </Select>
            <TextField
                size="small"
                value={value}
                onChange={e => {
                    setValue(e.target.value)
                }}
                sx={{
                    mr: 1,
                }}
            />
            <IconButton
                sx={{ verticalAlign: "revert" }}
                onClick={props.onHandleDelete}
            >
                <DeleteIcon
                    sx={{
                        fontSize: "80%",
                    }}
                />
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
    filter.right !== undefined &&
    filter.right !== ""

const arrayRemove = <A,>(a: Array<A>, i: number): Array<A> =>
    a.slice(0, i).concat(...a.slice(i + 1))

const filterEquals = (f1: WipFilter, f2: WipFilter) =>
    f1.left?.parentColumnId === f2.left?.parentColumnId &&
    f1.operator === f2.operator &&
    f1.right === f2.right
