import React, { useState, useEffect, useRef } from "react"
import CloseIcon from "@mui/icons-material/Close"
import AddBoxIcon from "@mui/icons-material/AddBox"
import {
    Popper,
    Paper,
    IconButton,
    Stack,
    Box,
    Typography,
} from "@mui/material"

import { ViewDescriptor } from "@intutable/lazy-views/dist/types"
import { SimpleFilter, FILTER_OPERATORS } from "@backend/condition"
import { TableColumn } from "types/rdg"
import { useAPI } from "context/APIContext"
import { PartialFilter, FilterListItem, isValidFilter } from "./Filter"

type FilterWindowProps = {
    anchorEl: Element | null
    /** The columns the user can choose the left operand from. */
    columns: TableColumn[]
    /**
     * The real filters, from the back-end, currently constraining the
     * data being displayed.
     */
    activeFilters: SimpleFilter[]
    onHandleCloseEditor: () => void
    /**
     * Callback for saving filters (write to back-end)
     */
    onUpdateFilters: (newFilters: SimpleFilter[]) => Promise<void>
}

/**
 * There are no IDs on the filters, so this component has to manage them.
 * This type pairs a filter (or an incomplete filter, or...) with a key.
 */
type KeyedFilter<F> = {
    key: number | string
    filter: F
}

/**
 * A placeholder: either an incomplete filter that the `FilterWindow` keeps
 * track of because it can't be saved to the DB, or a placeholder for a
 * full-fledged filter that comes from the back-end.
 */
type FilterPlaceholder = KeyedFilter<PartialFilter | null>
/**
 * A filter that is (possibly) not yet saved.
 */
type UnsavedFilter = KeyedFilter<PartialFilter>

const isUnsaved = (p: FilterPlaceholder): p is UnsavedFilter =>
    p.filter !== null
const isPlaceholder = (p: FilterPlaceholder): p is KeyedFilter<null> =>
    p.filter === null

/**
 * A pop-up window with a list of filters to apply to the data being shown.
 */
export const FilterWindow: React.FC<FilterWindowProps> = props => {
    /**
     * `Popper` does not work with `ClickAwayListener`, so we hacked this to
     * close the editor window whenever the user switches views.
     */
    const { view } = useAPI()
    const viewRef = useRef<ViewDescriptor | null>()
    useEffect(() => {
        viewRef.current = view
    }, [view])
    const prevView = viewRef.current
    useEffect(() => {
        if (prevView && prevView.id !== view?.id) props.onHandleCloseEditor()
    }, [view, prevView, props])

    /**
     * The filters have no IDs or anything, so we need to supply our own keys.
     * Using a ref ensures they stay consistent as long as the window is open.
     */
    const nextKey = useRef<number>(0)
    const getNextKey = () => {
        const key = nextKey.current
        nextKey.current = nextKey.current + 1
        return key
    }
    const newUnsavedFilter = (): FilterPlaceholder => ({
        key: getNextKey(),
        filter: {
            operator: FILTER_OPERATORS[0].raw,
        },
    })

    /**
     * We want the user to be able to save and apply filters without the
     * incomplete ones they are also editing to be deleted on each re-render
     * (which happens whenever an active filter changes).
     * To this end, we keep a list of "placeholders" that stores both
     * "unsaved" filters which cannot be committed to the view yet, and
     * ones that are already active. The spots of saved/active filters are
     * remembered with a {@link FilterPlaceholder} that has a null in it.
     * important invariant: number of nulls in
     * {@link filterPlaceholders} <= number of elements in
     * {@link props.activeFilters}`.
     */
    const initPlaceholders = (activeFilters: SimpleFilter[]) => {
        if (activeFilters.length > 0)
            return props.activeFilters.map(_ => ({
                key: getNextKey(),
                filter: null,
            }))
        else return [newUnsavedFilter()]
    }
    const [filterPlaceholders, setFilterPlaceholders] = useState<
        FilterPlaceholder[]
    >(() => initPlaceholders(props.activeFilters))

    /**
     * {@link filterPlaceholders} but with all the null slots filled with
     * active filters from the back-end. We need this for rendering, but all
     * the logic uses {@link filterPlaceholders}
     */
    const [unsavedFilters, setUnsavedFilters] = useState<UnsavedFilter[]>([])

    /**
     * Merge {@link filterPlaceholders} with the active/saved filters from the
     * back-end to get set of filters to display.
     */
    useEffect(() => {
        if (!props.activeFilters || !filterPlaceholders) return

        const displayFilters = new Array(filterPlaceholders.length)
        for (
            let aIndex = 0, wIndex = 0;
            wIndex < filterPlaceholders.length;
            wIndex++
        ) {
            if (!isUnsaved(filterPlaceholders[wIndex])) {
                displayFilters[wIndex] = {
                    key: filterPlaceholders[wIndex].key,
                    filter: props.activeFilters[aIndex],
                }
                aIndex++
            } else {
                displayFilters[wIndex] = filterPlaceholders[wIndex]
            }
        }
        setUnsavedFilters(displayFilters)
    }, [props.activeFilters, filterPlaceholders])

    const handleAddFilter = () =>
        setFilterPlaceholders(prev => prev.concat(newUnsavedFilter()))

    /**
     * Delete a filter - if it's unsaved filter, just remove the GUI component,
     * otherwise, we have to talk to the back-end.
     */
    const handleDeleteFilter = async (key: number | string): Promise<void> => {
        const index = filterPlaceholders.findIndex(f => f.key === key)!
        if (!unsavedFilters) return
        else if (isUnsaved(filterPlaceholders[index]))
            setFilterPlaceholders(prev => arrayRemove(prev, index))
        else {
            // find index within the active filters:
            const aIndex =
                filterPlaceholders.slice(0, index + 1).filter(isPlaceholder)
                    .length - 1
            setFilterPlaceholders(prev => arrayRemove(prev, index))
            const newFilters = arrayRemove(props.activeFilters, aIndex)
            return props.onUpdateFilters(newFilters)
        }
    }

    const assignFilter = <F1, F2>(
        old: KeyedFilter<F1>,
        filter: F2
    ): KeyedFilter<F2> => ({
        key: old.key,
        filter,
    })
    /**
     * If a filter becomes invalid, e.g. if the user deletes the text of
     * its "value" field, then it becomes an unsaved filter.
     */
    const handleFilterBecomeInvalid = async (
        key: number | string,
        incomplete: PartialFilter
    ): Promise<void> => {
        const index = filterPlaceholders.findIndex(f => f.key === key)
        if (!unsavedFilters) return
        else if (isUnsaved(filterPlaceholders[index])) return
        else {
            const aIndex =
                filterPlaceholders.slice(0, index + 1).filter(isPlaceholder)
                    .length - 1
            setFilterPlaceholders(prev => {
                const copy = [...prev]
                copy[index] = assignFilter(copy[index], incomplete)
                return copy
            })
            const newFilters = arrayRemove(props.activeFilters, aIndex)
            return props.onUpdateFilters(newFilters)
        }
    }

    /** Save a complete filter to the back-end. */
    const handleCommitFilter = async (
        key: number | string,
        newFilter: SimpleFilter
    ): Promise<void> => {
        const index = filterPlaceholders.findIndex(f => f.key === key)
        if (!unsavedFilters) return
        const filterCopy = [...unsavedFilters]
        filterCopy[index] = assignFilter(filterCopy[index], newFilter)
        const newFilters = filterCopy
            .map(unsaved => unsaved.filter)
            .filter(isValidFilter)
        await props.onUpdateFilters(newFilters)
        setFilterPlaceholders(prev => {
            const copy = [...prev]
            copy[index] = assignFilter(copy[index], null)
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
                    {unsavedFilters &&
                        unsavedFilters.map(f => (
                            <FilterListItem
                                key={f.key}
                                columns={props.columns}
                                filter={f.filter}
                                onHandleDelete={() => handleDeleteFilter(f.key)}
                                onCommit={value =>
                                    handleCommitFilter(f.key, value)
                                }
                                onBecomeInvalid={value =>
                                    handleFilterBecomeInvalid(f.key, value)
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

const arrayRemove = <A,>(a: Array<A>, i: number): Array<A> => {
    if (i < 0 || i >= a.length)
        throw TypeError(`arrayRemove: index out of bounds`)
    else return a.slice(0, i).concat(...a.slice(i + 1))
}
