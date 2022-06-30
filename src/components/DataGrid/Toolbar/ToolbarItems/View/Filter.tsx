import React, { useState, useEffect, useCallback, useRef } from "react"
import DeleteIcon from "@mui/icons-material/Delete"
import {
    useTheme,
    Select,
    MenuItem,
    TextField,
    IconButton,
    Box,
} from "@mui/material"
import { SimpleFilter, FILTER_OPERATORS } from "@backend/condition"
import { TableColumn } from "types/rdg"
import { WipFilter, isValidFilter, filterEquals } from "./FilterWindow"

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
export const SingleFilter: React.FC<SingleFilterProps> = props => {
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
