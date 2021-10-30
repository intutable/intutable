import WarningIcon from "@mui/icons-material/Warning"
import {
    GridOverlay,
} from "@mui/x-data-grid"


export const CustomNoRowsOverlay = () =>
    <GridOverlay>
        <WarningIcon />
        <div>No Data Found</div>
    </GridOverlay>

