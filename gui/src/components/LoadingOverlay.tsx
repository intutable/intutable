import { Backdrop, CircularProgress } from "@mui/material"

type LoadingOverlayProps = {
    open: boolean
    /** E.g. a modal, default is progress indicator */
    children?: React.ReactNode
}

/**
 * The Loading Overlay is specifically designed when the user is waiting
 * for a response and shouldn't do anything else.
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ open, children }) => {
    return (
        <Backdrop
            sx={{ color: "#fff", zIndex: theme => theme.zIndex.drawer + 1 }}
            open={open}
            // onClick={}
        >
            {children ? children : <CircularProgress color="inherit" />}
        </Backdrop>
    )
}
