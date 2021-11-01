import AddIcon from "@mui/icons-material/Add"
import {
    Button,
    ButtonProps
} from "@mui/material"
import {
    GridToolbarContainer,
    GridToolbarContainerProps,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport,
    GridToolbar,
} from "@mui/x-data-grid"


const GridToolbarAddColButton = (props: ButtonProps) => (
    <Button {...props}>
        <AddIcon />
        Add Col
    </Button> )

// TODO: implement Button in Toolbar to add a col
export const CustomToolbar = (props: GridToolbarContainerProps) => (
    <GridToolbarContainer>
        <GridToolbar {...props} />
        <GridToolbarAddColButton onClick={() => { }} />
    </GridToolbarContainer> )
