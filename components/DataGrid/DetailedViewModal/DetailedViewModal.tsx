/**
 * @author Heidelberg University
 * @version 0.1.0
 * @file DetailedViewModal.tsx
 * @description A Modal which shows detailed information when clicked in a row about the data set
 * @since date.month.2021
 * @license
 * @copyright © 2021 Heidelberg University
 */

// Node Modules

// Assets

// CSS

// Components
import {
    Modal,
    Box,
    Typography
} from "@mui/material"

// Utils / Types / Api

type DetailedViewModalProps = {
    open: boolean
    onCloseHandler: () => void
}

export const DetailedViewModal: React.FC<DetailedViewModalProps> = props => {



    return <>
        <Modal
            open={props.open}
            onClose={props.onCloseHandler}
        >
            <Box sx={{}}>
                <Typography variant="h6" component="h2">
                    Detailed View
                </Typography>
            </Box>
        </Modal>

    </>

}