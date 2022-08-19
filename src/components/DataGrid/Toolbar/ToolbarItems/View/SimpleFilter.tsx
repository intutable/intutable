import React from "react"
import { IconButton } from "@mui/material"
import FormatIndentIncreaseIcon from "@mui/icons-material/FormatIndentIncrease"
import {
    Select,
    SelectChangeEvent,
    MenuItem,
    TextField,
    Box,
} from "@mui/material"
import {
    FILTER_OPERATORS_LIST,
    FilterOperator,
    Column,
    OperandKind,
    PartialSimpleFilter,
} from "types/filter"
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

    const getColumn = (columnId: number | string) => {
        const column = columns.find(c => c._id === columnId)
        return column ? { parentColumnId: column._id, joinId: null } : undefined
    }

    const handleChangeColumn = (e: SelectChangeEvent<number | string>) => {
        // apparently TSC cant understand the typing of the elvis operator
        const newColumnSpec = getColumn(e.target.value)
        let newColumn: Column | undefined
        if (newColumnSpec)
            newColumn = {
                kind: OperandKind.Column,
                column: newColumnSpec,
            }
        else newColumn = undefined
        onChange({
            ...filter,
            left: newColumn,
        })
    }
    const handleChangeOperator = (e: SelectChangeEvent<FilterOperator>) =>
        onChange({
            ...filter,
            operator: e.target.value as FilterOperator,
        })
    const handleChangeValue = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        onChange({
            ...filter,
            right: { kind: OperandKind.Literal, value: e.target.value },
        })

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
                value={filter.left?.column.parentColumnId ?? ""}
                onChange={handleChangeColumn}
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
                value={filter.operator ?? ""}
                onChange={handleChangeOperator}
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
                value={filter.right?.value ?? ""}
                onChange={handleChangeValue}
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
