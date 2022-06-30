/**
 * TODO: find a good place for isValidFilter, decide which component should
 * be deciding when to commit.
 * give singlefilter only one commit function, let parent component decide if
 * it's valid or not.
 */
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
import { SingleFilter } from "./Filter"

type FilterWindowProps = {
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

export type WipFilter = Partial<SimpleFilter>

/**
 * We want the user to be able to save and apply filters without the
 * incomplete ones they are also editing to be deleted on each re-render.
 * To this end, we keep a list of "WIP filters" that stores filters which
 * cannot be committed to the view yet. If the view's "active" filters change,
 * the new array is merged with the WIP filters.
 */
export const FilterWindow: React.FC<FilterWindowProps> = props => {
    /**
     * If the view changes, our wip-nulls ~ active filters invariant
     * (see {@link wipFilters} cannot be maintained, so close the editor.
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
     * The trick is that `wipFilters` is as long as there are filters in total,
     * and the active filters' positions are kept free with `null`.
     * important invariant: the number of nulls in `wipFilters` <= number of
     * elements in `props.activeFilters`. This is also why we close the
     * editor when the current view changes.
     */
    // TODO: rename: `unsavedFilters`
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
        for (let aIndex = 0, wIndex = 0; wIndex < wipFilters.length; wIndex++) {
            if (wipFilters[wIndex] === null) {
                displayFilters[wIndex] = props.activeFilters[aIndex]
                aIndex++
            } else {
                displayFilters[wIndex] = wipFilters[wIndex]
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

const newEmptyWipFilter = (): WipFilter => ({
    operator: FILTER_OPERATORS[0].raw,
})

export const isValidFilter = (filter: WipFilter): filter is SimpleFilter =>
    filter.left !== undefined &&
    filter.operator !== undefined &&
    filter.right !== undefined &&
    filter.right !== ""

const arrayRemove = <A,>(a: Array<A>, i: number): Array<A> =>
    a.slice(0, i).concat(...a.slice(i + 1))

export const filterEquals = (f1: WipFilter, f2: WipFilter) =>
    f1.left?.parentColumnId === f2.left?.parentColumnId &&
    f1.operator === f2.operator &&
    f1.right === f2.right
