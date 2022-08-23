import React, { useState, useEffect, useRef, useCallback } from "react"
import CloseIcon from "@mui/icons-material/Close"
import DeleteIcon from "@mui/icons-material/Delete"
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
import { TableColumn } from "types/rdg"
import {
    ConditionKind,
    Filter,
    PartialFilter,
    PartialSimpleFilter,
    FILTER_OPERATORS_LIST,
} from "types/filter"
import {
    wherePartial,
    and,
    stripPartialFilter,
    partialFilterEquals,
} from "utils/filter"
import { useAPI } from "context/APIContext"
import { useUpdateTimer } from "hooks/useUpdateTimer"
import { FilterEditor } from "./Filter"
import { SimpleFilterEditor } from "./SimpleFilter"

type FilterWindowProps = {
    anchorEl: Element | null
    /** The columns the user can choose the left operand from. */
    columns: TableColumn[]
    /**
     * The real filters, from the back-end, currently constraining the
     * data being displayed.
     */
    activeFilters: Filter[]
    onHandleCloseEditor: () => void
    /**
     * Callback for saving filters (write to back-end)
     */
    onUpdateFilters: (newFilters: Filter[]) => Promise<void>
}

/**
 * There are no IDs on the filters, so this component has to manage them.
 * This type pairs a filter (or an incomplete filter, or...) with a key.
 */
type KeyedFilter = {
    key: string | number
    filter: PartialFilter
}

/**
 * A pop-up window with a list of filters to apply to the data being shown.
 */
export const FilterWindow: React.FC<FilterWindowProps> = props => {
    const { columns, activeFilters, onHandleCloseEditor, onUpdateFilters } =
        props
    /**
     * `Popper` does not work with `ClickAwayListener`, so we hacked this to
     * at least close the editor window whenever the user switches views.
     */
    const { view } = useAPI()
    const viewRef = useRef<ViewDescriptor | null>()
    useEffect(() => {
        viewRef.current = view
    }, [view])
    const prevView = viewRef.current
    useEffect(() => {
        if (prevView && prevView.id !== view?.id) onHandleCloseEditor()
    }, [view, prevView, onHandleCloseEditor])

    /** The filters have no IDs, so we need to supply our own keys. */
    const nextKey = useRef<number>(0)
    const getNextKey = () => {
        const key = nextKey.current
        nextKey.current = nextKey.current + 1
        return key
    }
    const newUnsavedFilter = (): KeyedFilter => ({
        key: getNextKey(),
        filter: {
            kind: ConditionKind.Infix,
            operator: FILTER_OPERATORS_LIST[0].raw,
        },
    })

    /** The actual filters currently being displayed */
    const setupInitialFilters = (filters: Filter[]): KeyedFilter[] => {
        if (filters.length !== 0)
            return filters.map(f => ({
                key: getNextKey(),
                filter: f,
            }))
        else return [newUnsavedFilter()]
    }
    const [filters, setFilters] = useState<KeyedFilter[]>(() =>
        setupInitialFilters(activeFilters)
    )

    /** Save filters to the back-end and apply them. */
    const applyFilters = useCallback(() => {
        onUpdateFilters(extractFilters(filters))
        return Promise.resolve(null)
    }, [onUpdateFilters, filters])
    const { update } = useUpdateTimer<null>(applyFilters, 500)

    useEffect(() => {
        // if the new filters are semantically different from the old ones,
        // apply them
        const newActiveFilters = extractFilters(filters)
        if (
            activeFilters.length !== newActiveFilters.length ||
            !(activeFilters as PartialFilter[]).every((f, i) =>
                partialFilterEquals(f, newActiveFilters[i])
            )
        )
            update()
    }, [activeFilters, update, filters])

    const handleAddFilter = () =>
        setFilters(prev => prev.concat(newUnsavedFilter()))

    const handleDeleteFilter = async (key: number | string): Promise<void> => {
        const index = filters.findIndex(f => f.key === key)
        if (index !== -1) setFilters(prev => arrayRemove(prev, index))
    }

    /**
     * Promote a {@link SimpleFilterEditor} to {@link FilterEditor}, which
     * is a composite (AND, OR, NOT) filter.
     */
    const handlePromoteFilter = async (
        key: number | string,
        filter: PartialSimpleFilter
    ) => {
        return handleChangeFilter(
            key,
            and(filter, wherePartial(undefined, "=", undefined))
        )
    }
    /**
     * Triggered whenever a filter changes. For now, updates the view.
     */
    const handleChangeFilter = async (
        key: number | string,
        newFilter: PartialFilter
    ): Promise<void> => {
        const index = filters.findIndex(f => f.key === key)
        if (index === -1) return
        const newFilters = [...filters]
        newFilters[index] = { key, filter: newFilter }
        setFilters(newFilters)
    }

    return (
        <Popper open={props.anchorEl != null} anchorEl={props.anchorEl}>
            <Paper elevation={2} sx={{ padding: "16px" }}>
                <Stack>
                    <Box>
                        <Typography></Typography>
                        <IconButton
                            onClick={onHandleCloseEditor}
                            sx={{
                                float: "right",
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    {filters &&
                        filters.map(f => (
                            <Box sx={{ display: "flex" }}>
                                {f.filter.kind === ConditionKind.Infix ? (
                                    <SimpleFilterEditor
                                        key={f.key}
                                        columns={columns}
                                        filter={f.filter}
                                        onPromote={async filter =>
                                            handlePromoteFilter(f.key, filter)
                                        }
                                        onChange={async filter =>
                                            handleChangeFilter(f.key, filter)
                                        }
                                        nestingDepth={0}
                                    />
                                ) : (
                                    <FilterEditor
                                        key={f.key}
                                        columns={columns}
                                        filter={f.filter}
                                        onDemote={async filter =>
                                            handleChangeFilter(f.key, filter)
                                        }
                                        onChange={async filter =>
                                            handleChangeFilter(f.key, filter)
                                        }
                                        nestingDepth={0}
                                    />
                                )}
                                <IconButton
                                    sx={{
                                        verticalAlign: "revert",
                                        float: "right",
                                    }}
                                    onClick={() => handleDeleteFilter(f.key)}
                                >
                                    <DeleteIcon sx={{ fontSize: "80%" }} />
                                </IconButton>
                            </Box>
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

const extractFilters = (filters: KeyedFilter[]): Filter[] => {
    // yes, the type checker does need this.
    function notNull<T>(x: T | null): x is T {
        return x !== null
    }
    return filters.map(f => stripPartialFilter(f.filter)).filter(notNull)
}
