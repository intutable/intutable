import React from "react"
import {
    Select,
    SelectChangeEvent,
    MenuItem,
    IconButton,
    Box,
    Stack,
} from "@mui/material"
import FormatIndentDecreaseIcon from "@mui/icons-material/FormatIndentDecrease"
import { ConditionKind } from "@intutable/lazy-views/dist/condition"
import { PartialFilter, PartialSimpleFilter } from "types/filter"
import { wherePartial, and, or, not } from "utils/filter"
import { TableColumn } from "types/rdg"
import { SimpleFilterEditor } from "./SimpleFilter"

const Infix = ConditionKind.Infix
const Not = ConditionKind.Not
const And = ConditionKind.And
const Or = ConditionKind.Or

/**
 * @prop {TableColumn[]} columns We filter by conditions of the form
 * "<column x> < 100", so we need to know what columns are available.
 * @prop {(newFilter: PartialFilter) => Promise<void>} onChange What to do
 * when the filter changes
 */
type FilterEditorProps = {
    filter: Exclude<PartialFilter, PartialSimpleFilter>
    /**
     * @prop {TableColumn[]} columns We filter by conditions of the form
     * "<column x> < 100", so we need to know what columns are available.
     */
    columns: TableColumn[]
    onChange: (newFilter: PartialFilter) => Promise<void>
    /**
     * change an inner (not top-level) filter to a {@link SimpleFilterEditor},
     * "demoting" it. The filter will try to salvage some of the data entered
     * (e.g., one of the branches of an AND) and pass it into the callback.
     */
    onDemote: (p: PartialSimpleFilter) => Promise<void>
}

export const FilterEditor: React.FC<FilterEditorProps> = props => {
    const { filter, columns, onDemote, onChange } = props

    const newFilter = () => wherePartial(undefined, "=", undefined)

    const handleChangeKind = (e: SelectChangeEvent<ConditionKind>) => {
        const kind = e.target.value
        if (filter.kind === kind) return
        else if (filter.kind === Not) {
            if (kind === Infix) onChange(filter.condition)
            else if (kind === And) onChange(and(filter.condition, newFilter()))
            else onChange(or(filter.condition, newFilter()))
        } else {
            if (kind === Infix) onChange(filter.left)
            else if (kind === Not) onChange(not(filter.left))
            else if (kind === And) onChange(and(filter.left, filter.right))
            else onChange(or(filter.left, filter.right))
        }
    }
    /** For AND and OR filters: change the left branch */
    const handleChangeLeft = async (f: PartialFilter) => {
        if (filter.kind === And || filter.kind === Or)
            return onChange({ ...filter, left: f })
    }
    /** For AND and OR filters: change the right branch */
    const handleChangeRight = async (f: PartialFilter) => {
        if (filter.kind === And || filter.kind === Or)
            return onChange({ ...filter, right: f })
    }

    /** Demote this filter to a simple filter. */
    // Todo: save some of the complex filter, instead of throwing it all out
    const handleDemote = async () => {
        return onDemote(wherePartial(undefined, "=", undefined))
    }

    /**
     * Promote the inner filter of a NOT condition to a complex filter.
     * The default kind is AND.
     */
    const handlePromoteNot = async (f: PartialSimpleFilter) =>
        onChange(not(and(f, newFilter())))
    /**
     * Promote the left branch of an AND or OR condition to a complex filter.
     * The default kind is AND.
     */
    const handlePromoteLeft = async (f: PartialSimpleFilter) => {
        if (filter.kind === And || filter.kind === Or)
            return onChange({
                ...filter,
                left: and(f, newFilter()),
            })
    }
    /**
     * Promote the right branch of an AND or OR condition to a complex filter.
     * The default kind is AND.
     */
    const handlePromoteRight = async (f: PartialSimpleFilter) => {
        if (filter.kind === And || filter.kind === Or)
            return onChange({
                ...filter,
                right: and(f, newFilter()),
            })
    }
    /** Demote the inner filter of a NOT condition to a simple filter. */
    const handleDemoteNot = async (f: PartialSimpleFilter) => onChange(not(f))
    /** Demote the left branch of an AND or OR condition to a simple filter. */
    const handleDemoteLeft = async (f: PartialSimpleFilter) => {
        if (filter.kind === And || filter.kind === Or)
            return onChange({
                ...filter,
                left: f,
            })
    }
    /** Demote the right branch of an AND or OR condition to a simple filter. */
    const handleDemoteRight = async (f: PartialSimpleFilter) => {
        if (filter.kind === And || filter.kind === Or)
            return onChange({
                ...filter,
                right: f,
            })
    }

    console.log(JSON.stringify(filter))

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
            <Select defaultValue={filter.kind} onChange={handleChangeKind}>
                <MenuItem key={Not} value={Not}>
                    NOT
                </MenuItem>
                <MenuItem key={And} value={And}>
                    AND
                </MenuItem>
                <MenuItem key={Or} value={Or}>
                    OR
                </MenuItem>
            </Select>
            {filter.kind === Not ? (
                filter.condition.kind === Infix ? (
                    <SimpleFilterEditor
                        filter={filter.condition}
                        columns={columns}
                        onPromote={handlePromoteNot}
                        onChange={f => onChange(not(f))}
                    />
                ) : (
                    <FilterEditor
                        filter={filter.condition}
                        columns={columns}
                        onDemote={handleDemoteNot}
                        onChange={f => onChange(not(f))}
                    />
                )
            ) : (
                <Stack spacing={1}>
                    {filter.left.kind === Infix ? (
                        <SimpleFilterEditor
                            filter={filter.left}
                            columns={columns}
                            onPromote={handlePromoteLeft}
                            onChange={handleChangeLeft}
                        />
                    ) : (
                        <FilterEditor
                            filter={filter.left}
                            columns={columns}
                            onDemote={handleDemoteLeft}
                            onChange={handleChangeLeft}
                        />
                    )}
                    {filter.right.kind === Infix ? (
                        <SimpleFilterEditor
                            filter={filter.right}
                            columns={columns}
                            onPromote={handlePromoteRight}
                            onChange={handleChangeRight}
                        />
                    ) : (
                        <FilterEditor
                            filter={filter.right}
                            columns={columns}
                            onDemote={handleDemoteRight}
                            onChange={handleChangeRight}
                        />
                    )}
                </Stack>
            )}
            <IconButton sx={{ verticalAlign: "revert" }} onClick={handleDemote}>
                <FormatIndentDecreaseIcon sx={{ fontSize: "80%" }} />
            </IconButton>
        </Box>
    )
}
