import React, { useState } from "react"
import FilterListIcon from "@mui/icons-material/FilterList"
import CloseIcon from "@mui/icons-material/Close"
import {
    Button,
    Popper,
    Paper,
    Select,
    MenuItem,
    TextField,
    IconButton,
} from "@mui/material"

import { TableColumn } from "types/rdg"
import { CONDITION_OPERATORS } from "@backend/condition"
import { isAppColumn } from "api/utils/de_serialize/column"
import { useTable } from "hooks/useTable"

/**
 * Button to open the filter editor
 */
export const EditFilters: React.FC = () => {
    const { data } = useTable()
    const [anchorEl, setAnchorEl] = useState<Element | null>(null)

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

    return (
        <>
            <Button startIcon={<FilterListIcon />} onClick={toggleEditor}>
                Filter
            </Button>
            <Popper open={anchorEl != null} anchorEl={anchorEl}>
                <Paper elevation={2} sx={{ padding: "16px" }}>
                    <IconButton
                        onClick={handleCloseEditor}
                        sx={{
                            float: "right",
                            display: "block",
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    {data && (
                        <SingleFilter
                            columns={data.columns.filter(c => !isAppColumn(c))}
                        />
                    )}
                </Paper>
            </Popper>
        </>
    )
}

type SingleFilterProps = {
    columns: TableColumn[]
}
/**
 * A single, basic filter of the form <column> <operator> <value>.
 */
const SingleFilter: React.FC<SingleFilterProps> = props => {
    return (
        <>
            <Select defaultValue={props.columns[0]._id}>
                {props.columns.map(c => (
                    <MenuItem key={c._id} value={c._id}>
                        {c.name}
                    </MenuItem>
                ))}
            </Select>
            <Select defaultValue={"="}>
                {CONDITION_OPERATORS.map(op => (
                    <MenuItem key={op} value={op}>
                        {op}
                    </MenuItem>
                ))}
            </Select>
            <TextField variant="filled"></TextField>
        </>
    )
}
