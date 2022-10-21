import cells from "@datagrid/Cells"
import {
    ExposedInputUpdateCallback,
    ExposedInputUpdateHandler,
} from "@datagrid/Cells/abstract/Cell"
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Slide,
    Stack,
    Typography,
} from "@mui/material"
import type { TransitionProps } from "@mui/material/transitions"
import { useView } from "hooks/useView"
import React, { useState } from "react"
import { CalculatedColumn } from "react-data-grid"
import { Row, Column } from "types"
import { ColumnUtility } from "utils/ColumnUtility"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import CloseIcon from "@mui/icons-material/Close"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import AddBoxIcon from "@mui/icons-material/AddBox"

type RowNavigatorProps = {
    currentIndex: number
    maxIndex: number
    onNavigate: (index: number) => void
}
const RowNavigator: React.FC<RowNavigatorProps> = props => {
    const next = () =>
        props.onNavigate(
            props.currentIndex + 1 > props.maxIndex ? 0 : props.currentIndex + 1
        )
    const previous = () =>
        props.onNavigate(
            props.currentIndex - 1 < 0 ? props.maxIndex : props.currentIndex - 1
        )

    return (
        <Stack
            sx={{
                mr: 1,
            }}
        >
            <ArrowDropUpIcon
                fontSize="small"
                sx={{
                    cursor: "pointer",
                }}
                onClick={previous}
            />
            <ArrowDropDownIcon
                fontSize="small"
                sx={{
                    cursor: "pointer",
                }}
                onClick={next}
            />
        </Stack>
    )
}

const getExposedInput = (type: Column.Serialized["_cellContentType"]) => {
    const cellUtil = cells.getCell(type)
    return cellUtil.ExposedInput
}

type RowModalProps = {
    open: boolean
    onCloseHandler: () => void
    /**
     * @default false
     */
    mode: "createNewRow" | { row: Row; column: Column | CalculatedColumn<Row> }
    onNavigateRow: (rowIndex: number) => void
}

export const RowMask: React.FC<RowModalProps> = props => {
    const { data } = useView()

    const [state, setState] = useState(null)

    const abort = () => {
        props.onCloseHandler()
    }
    const create = () => {}
    const save = () => {}

    if (data == null) return null

    return (
        <Dialog
            open={props.open}
            fullWidth
            maxWidth="xs"
            onClose={props.onCloseHandler}
        >
            <DialogTitle>
                <Stack direction="row">
                    {props.mode !== "createNewRow" && (
                        <RowNavigator
                            currentIndex={props.mode.row.__rowIndex__}
                            maxIndex={data.rows.length - 1}
                            onNavigate={props.onNavigateRow}
                        />
                    )}
                    {props.mode === "createNewRow"
                        ? "Neue Zeile erstellen"
                        : `Zeile ${props.mode.row.__rowIndex__}`}
                    <IconButton>
                        <MoreHorizIcon fontSize="small" />
                    </IconButton>
                    <Divider orientation="vertical" />
                    <IconButton onClick={props.onCloseHandler}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <Divider />

            <DialogContent
                sx={{
                    overflowY: "scroll",
                    maxHeight: "70%",
                }}
            >
                {data.columns
                    .filter(
                        column => ColumnUtility.isAppColumn(column) === false
                    )
                    .map(column => (
                        <Stack direction="row" key={column._id!}>
                            <Typography>
                                {cells.getCell(column._cellContentType!).icon}
                                {column.name}
                            </Typography>
                            {(() => {
                                const Input = getExposedInput(
                                    column._cellContentType!
                                )

                                const updateCallback: ExposedInputUpdateCallback =
                                    {
                                        onChange: value => {},
                                    }

                                const content =
                                    props.mode === "createNewRow"
                                        ? undefined
                                        : props.mode.row[column.key]

                                return (
                                    <Input
                                        content={content}
                                        updateHandler={
                                            props.mode === "createNewRow"
                                                ? updateCallback
                                                : { ...props.mode }
                                        }
                                    />
                                )
                            })()}
                        </Stack>
                    ))}

                <Typography>
                    <AddBoxIcon fontSize="small" />
                    Neue Spalte erstellen
                </Typography>
            </DialogContent>
            {props.mode === "createNewRow" && (
                <DialogActions sx={{ flexWrap: "wrap" }}>
                    <Divider />
                    <Button onClick={abort}>Abbrechen</Button>
                    <Button onClick={create}>Erstellen</Button>
                </DialogActions>
            )}
        </Dialog>
    )
}

export default RowMask
