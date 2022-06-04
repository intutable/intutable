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

import { CONDITION_OPERATORS } from "@backend/condition"
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
        <Button
            startIcon={<FilterListIcon />}
            onClick={toggleEditor}
        >
            Filter
        </Button>
        <Popper
            open={anchorEl != null}
            anchorEl={anchorEl}
        >
            <Paper elevation={2} sx={{ padding: "16px" }}>
                <IconButton
                    onClick={handleCloseEditor}
                    sx={{
                        float: "right",
                        display: "block"
                    }}
                >
                    <CloseIcon />
                </IconButton>
                {data &&
                    <Select defaultValue={data.metadata.columns[0].id}>
                        {data.metadata.columns.map(c =>
                            <MenuItem value={c.id}>{c.name}</MenuItem>
                        )}
                    </Select>
                }
                {data &&
                    <Select defaultValue={"="}>
                        {CONDITION_OPERATORS.map(op =>
                            <MenuItem value={op}>{op}</MenuItem>
                        )}
                    </Select>
                }
                <TextField variant="filled">
                </TextField>
            </Paper>
        </Popper>
    </>
)
}

