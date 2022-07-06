import React, { useState, useEffect, useCallback, useRef } from "react"
import DeleteIcon from "@mui/icons-material/Delete"
import { Select, MenuItem, TextField, IconButton, Box } from "@mui/material"
import {
    SimpleFilter,
    FILTER_OPERATORS,
    LIKE_PATTERN_ESCAPE_CHARS,
} from "@backend/condition"
import { TableColumn } from "types/rdg"

export type PartialFilter = Partial<SimpleFilter>

export const filterEquals = (f1: PartialFilter, f2: PartialFilter) =>
    f1.left?.parentColumnId === f2.left?.parentColumnId &&
    f1.operator === f2.operator &&
    f1.right === f2.right

export const isValidFilter = (filter: PartialFilter): filter is SimpleFilter =>
    filter.left !== undefined &&
    filter.operator !== undefined &&
    filter.right !== undefined &&
    filter.right !== ""

/**
 * An editor component for one single filter. The total filter consists
 * of the logical conjunction of these.
 */
type FilterListItemProps = {
    /** When the user clicks "create new filter", a new filter with no data
     * in any of the input fields is generated. Also, a filter may have some
     * of its fields set, but not enough to send to the back-end yet, so we
     * can't just represent it with `null` or something.
     */
    filter: PartialFilter
    /** TEMP TableColumn is currently not usable for this task. */
    columns: TableColumn[]
    onHandleDelete: () => Promise<void>
    /**
     * When the data have been sufficiently set (plus a timer to avoid
     * excessive updates), the editor calls its `onCommitFilter` prop, asking
     * the parent component to commit the current filter to the back-end.
     */
    onCommit: (newFilter: SimpleFilter) => Promise<void>
    onBecomeInvalid: (partialFilter: PartialFilter) => Promise<void>
}

/**
 * A single, basic filter of the form <column> <operator> <value>.
 */
export const FilterListItem: React.FC<FilterListItemProps> = props => {
    const COMMIT_TIMEOUT = 500

    const { columns, filter, onCommit, onBecomeInvalid } = props

    const [column, setColumn] = useState<number | string>(
        filter.left?.parentColumnId || ""
    )
    const [operator, setOperator] = useState<string>(
        filter.operator || FILTER_OPERATORS[0].raw
    )
    const [value, setValue] = useState<string>(() =>
        prepareFilterValue(filter.right)
    )
    const [readyForCommit, setReadyForCommit] = useState<boolean>(true)
    /**
     * The current state of the filter in progress. Required for our
     * dynamic updating behavior below.
     */
    const filterState = useRef<PartialFilter>()

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
        const newFilter: PartialFilter = {
            left: columnSpec,
            operator: operator,
            right: operator === "LIKE" ? packContainsValue(value) : value,
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

const prepareFilterValue = (value: SimpleFilter["right"] | undefined): string =>
    value ? unpackContainsValue(value.toString()) : ""

/** Convert the value a user enters in a `contains` condition to database-ready
 * format (by adding percent symbols).
 */
const packContainsValue = (value: string): string =>
    "%" +
    value
        .split("")
        .map(c => (LIKE_PATTERN_ESCAPE_CHARS.includes(c) ? "\\" + c : c))
        .join("") +
    "%"

/**
 * Parse the SQL `LIKE` pattern into a format without format and escape chars.
 */
const unpackContainsValue = (value: string): string => {
    let acc: string = ""
    let lastWasBackslash: boolean = false
    const pos = 0
    for (let char of value.split("").slice(1, -1)) {
        if (!lastWasBackslash && char === "\\") {
            // saw a first backslash
            lastWasBackslash = true
        } else if (
            lastWasBackslash &&
            LIKE_PATTERN_ESCAPE_CHARS.includes(char)
        ) {
            // saw a backslash, now seeing \ % _
            lastWasBackslash = false
            acc = acc.concat(char)
        } else if (lastWasBackslash)
            // saw backslash, but not seeing an escapeable character after
            throw Error(
                `unpackContainsValue: unescaped \\ at ` + `position ${pos}`
            )
        else if (LIKE_PATTERN_ESCAPE_CHARS.includes(char))
            // seeing escapeable character without a backslash before it
            throw Error(
                `unpackContainsValue: unescaped ${char} at ` + `position ${pos}`
            )
        else acc = acc.concat(char)
    }
    return acc
}
