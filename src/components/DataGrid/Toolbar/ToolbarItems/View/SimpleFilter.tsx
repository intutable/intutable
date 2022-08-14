import React, { useState, useEffect, useCallback, useRef } from "react"
import DeleteIcon from "@mui/icons-material/Delete"
import { Select, MenuItem, TextField, IconButton, Box } from "@mui/material"
import {
    FILTER_OPERATORS_LIST,
    FilterOperator,
    OperandKind,
    ConditionKind,
    SimpleFilter,
    PartialSimpleFilter,
    LeftOperand,
    RightOperand,
} from "types/filter"
import * as f from "utils/filter"
import { TableColumn } from "types/rdg"

/**
 * An editor component for one single filter. The total filter consists
 * of the logical conjunction of these.
 */
type SimpleFilterEditorProps = {
    /** When the user clicks "create new filter", a new filter with no data
     * in any of the input fields is generated. Also, a filter may have some
     * of its fields set, but not enough to send to the back-end yet, so we
     * can't just represent it with `null` or something.
     */
    filter: PartialSimpleFilter
    /** TEMP TableColumn is currently not usable for this task. */
    columns: TableColumn[]
    onHandleDelete: () => Promise<void>
    /**
     * When the data have been sufficiently set (plus a timer to avoid
     * excessive updates), the editor calls its `onCommitFilter` prop, asking
     * the parent component to commit the current filter to the back-end.
     */
    onCommit: (newFilter: SimpleFilter) => Promise<void>
    onBecomeInvalid: (partialFilter: PartialSimpleFilter) => Promise<void>
}

/**
 * A single, basic filter of the form <column> <operator> <value>.
 */
export const SimpleFilterEditor: React.FC<SimpleFilterEditorProps> = props => {
    const COMMIT_TIMEOUT = 500

    const { columns, filter, onCommit, onBecomeInvalid } = props

    const [column, setColumn] = useState<number | string>(
        filter.left?.column.parentColumnId || ""
    )
    const [operator, setOperator] = useState<FilterOperator>(
        filter.operator || "="
    )
    const [value, setValue] = useState<string>(
        filter.right?.value.toString() || ""
    )

    const [readyForCommit, setReadyForCommit] = useState<boolean>(true)
    /**
     * The current state of the filter in progress. Required for our
     * dynamic updating behavior below.
     */
    const filterState = useRef<PartialSimpleFilter>()

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
            if (f.isValidFilter(newFilter)) await onCommit(newFilter)
            else await onBecomeInvalid(newFilter)
            setReadyForCommit(true)
        }, COMMIT_TIMEOUT)
        if (f.isValidFilter(currentFilter)) await onCommit(currentFilter)
        else await onBecomeInvalid(currentFilter)
    }, [onCommit, onBecomeInvalid])

    const assembleFilter = useCallback(() => {
        const leftColumn = columns.find(c => c._id === column)
        return assemblePartialSimpleFilter(leftColumn, operator, value)
    }, [column, operator, columns, value])

    /** See {@link commit} */
    useEffect(() => {
        const newFilter = assembleFilter()
        if (
            filterState.current &&
            f.partialFilterEquals(filterState.current, newFilter)
        )
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
                    setOperator(e.target.value as FilterOperator)
                }}
                sx={{
                    mr: 1,
                }}
                size="small"
            >
                {FILTER_OPERATORS_LIST.map(op => (
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

const assemblePartialSimpleFilter = (
    leftColumn: TableColumn | undefined,
    operator: FilterOperator,
    value: string
): PartialSimpleFilter => {
    const columnSpec: LeftOperand | undefined = leftColumn
        ? {
              kind: OperandKind.Column,
              column: {
                  parentColumnId: leftColumn._id,
                  joinId: null,
              },
          }
        : undefined
    const right: RightOperand = {
        kind: OperandKind.Literal,
        value,
    }
    const newFilter: PartialSimpleFilter = {
        kind: ConditionKind.Infix,
        left: columnSpec,
        operator: operator,
        right,
    }
    return newFilter
}
