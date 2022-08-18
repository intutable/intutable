import React, { useState, useEffect, useCallback, useRef } from "react"
import { IconButton } from "@mui/material"
import FormatIndentIncreaseIcon from "@mui/icons-material/FormatIndentIncrease"
import { Select, MenuItem, TextField, Box } from "@mui/material"
import {
    ConditionKind,
    FILTER_OPERATORS_LIST,
    FilterOperator,
    OperandKind,
    LeftOperand,
    RightOperand,
    PartialSimpleFilter,
} from "types/filter"
import { partialFilterEquals } from "utils/filter"
import { TableColumn } from "types/rdg"

/**
 * An editor component for one single, primitive filter. The filter applied
 * to the data consist of a boolean combination of these.
 */
type SimpleFilterEditorProps = {
    /** When the user clicks "create new filter", a new filter with no data
     * in any of the input fields is generated. Also, a filter may have some
     * of its fields set, but not enough to send to the back-end yet, so we
     * can't just represent it with `null` or something.
     */
    filter: PartialSimpleFilter
    columns: TableColumn[]
    onPromote: (filter: PartialSimpleFilter) => Promise<void>
    onChange: (newFilter: PartialSimpleFilter) => Promise<void>
}

/**
 * A single, basic filter of the form <column> <operator> <value>.
 */
export const SimpleFilterEditor: React.FC<SimpleFilterEditorProps> = props => {
    const { columns, filter, onPromote, onChange } = props

    const [column, setColumn] = useState<number | string>(
        filter.left?.column.parentColumnId || ""
    )
    const [operator, setOperator] = useState<FilterOperator>(
        filter.operator || "="
    )
    const [value, setValue] = useState<string>(
        filter.right?.value.toString() || ""
    )

    /**
     * The current state of the filter in progress. Required for our
     * dynamic updating behavior below.
     */
    const filterState = useRef<PartialSimpleFilter>()

    const assembleFilter = useCallback(() => {
        const leftColumn = columns.find(c => c._id === column)
        return assemblePartialSimpleFilter(leftColumn, operator, value)
    }, [column, operator, columns, value])

    useEffect(() => {
        const newFilter = assembleFilter()
        if (
            filterState.current &&
            partialFilterEquals(filterState.current, newFilter)
        )
            return
        filterState.current = newFilter
        onChange(newFilter)
    }, [column, operator, value, assembleFilter, onChange])

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
                onClick={() => onPromote(filter)}
            >
                <FormatIndentIncreaseIcon sx={{ fontSize: "80%" }} />
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
