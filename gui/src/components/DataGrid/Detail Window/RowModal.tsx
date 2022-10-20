import cells from "@datagrid/Cells"
import {
    ExposedInputUpdateCallback,
    ExposedInputUpdateHandler,
} from "@datagrid/Cells/abstract/Cell"
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Slide,
    Stack,
    Typography,
} from "@mui/material"
import type { TransitionProps } from "@mui/material/transitions"
import { useView } from "hooks/useView"
import React, { useState } from "react"
import { CalculatedColumn } from "react-data-grid"
import { Row, Column } from "types"

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
    mode: "createNewRow" | { row: Row; column: CalculatedColumn<Row> }
}

export const RowModal: React.FC<RowModalProps> = props => {
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
                {props.mode === "createNewRow"
                    ? "Neue Zeile erstellen"
                    : `Zeile ${"X"}`}
            </DialogTitle>

            <DialogContent>
                {data.columns.map(column => (
                    <Stack direction="row" key={column._id!}>
                        <Typography>{column.name}</Typography>
                        {(() => {
                            const Input = getExposedInput(
                                column._cellContentType!
                            )

                            const updateCallback: ExposedInputUpdateCallback = {
                                onChange: value => {},
                            }

                            const content =
                                props.mode === "createNewRow"
                                    ? undefined
                                    : undefined

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
            </DialogContent>

            <DialogActions sx={{ flexWrap: "wrap" }}>
                <Button onClick={abort}>Abbrechen</Button>
                <Button onClick={props.mode === "createNewRow" ? create : save}>
                    {props.mode === "createNewRow" ? "Erstellen" : "Übernehmen"}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default RowModal
