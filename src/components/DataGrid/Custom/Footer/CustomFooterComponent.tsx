import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord"
import {
    Box,
    useTheme,
} from "@mui/material"
import {
    GridFooterContainer,
    GridFooter
} from "@mui/x-data-grid"


export type Status = "connected" | "disconnected"

type FooterStatusComponentProps = {
    status: Status
}


const FooterStatusComponent = (props: FooterStatusComponentProps) =>
    <Box sx={{ display: "flex", padding: 2 }}>
        <FiberManualRecordIcon fontSize="small" sx={{
            mr: 1,
            ...(props.status === "connected" ? {
                color: "#4caf50"
            } : {
                color: "#d9182e"
            })
        }} />
        {props.status}
    </Box>


export const CustomFooterComponent = (props: FooterStatusComponentProps) =>
    <GridFooterContainer>
        <FooterStatusComponent status={props.status} />
        <GridFooter />
    </GridFooterContainer>

