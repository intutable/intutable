import { Row } from "../../../types/types"
import {
    Modal,
    Box,
    Typography,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Slide,
    TextField,
} from "@mui/material"
import React from "react"
import { CalculatedColumn } from "react-data-grid"
import type { TransitionProps } from "@mui/material/transitions"

/* eslint-disable */
const PopupTransition = React.forwardRef(
    (
        props: TransitionProps & {
            children: React.ReactElement<any, any>
        },
        ref: React.Ref<unknown>
    ) => <Slide direction="up" ref={ref} {...props} />
)
/* eslint-enable */

type DetailedViewModalProps = {
    open: boolean
    data: {
        row: Row
        column: CalculatedColumn<Row>
    }
    onCloseHandler: () => void
}

export const DetailedViewModal: React.FC<DetailedViewModalProps> = props => {
    return (
        <Dialog
            open={props.open}
            TransitionComponent={PopupTransition}
            keepMounted
            aria-describedby="row-detailed-view"
            fullWidth={true}
            maxWidth="xs"
            onClose={props.onCloseHandler}
        >
            <DialogTitle sx={{ textTransform: "uppercase" }}>
                Detail-Ansicht für Zeile {props.data.row.__id__}
            </DialogTitle>

            <DialogContent>
                <ul>
                    {Object.entries(props.data.row).map(([key, value], i) => (
                        <li key={i}>
                            {key}: {value}
                        </li>
                    ))}
                </ul>
            </DialogContent>

            <DialogActions sx={{ flexWrap: "wrap" }}>
                <Button onClick={props.onCloseHandler}>Schließen</Button>
                <Button>Speichern</Button>
            </DialogActions>
        </Dialog>
    )
}
