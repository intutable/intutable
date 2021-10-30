import {
    Modal,
    Box,
    Typography
} from "@mui/material"


type DetailedViewModalProps = {
    open: boolean
    onCloseHandler: () => void
}


export const DetailedViewModal: React.FC<DetailedViewModalProps> = props => {
    return ( <>
      <Modal
        open={props.open}
        onClose={props.onCloseHandler}>
        <Box sx={{}}>
          <Typography variant="h6" component="h2">
            Detailed View
          </Typography>
        </Box>
      </Modal>
    </> )
}
