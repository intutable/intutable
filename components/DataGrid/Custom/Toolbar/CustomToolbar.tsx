/**
 * @author Heidelberg University
 * @version 0.1.0
 * @file CustomToolbar.tsx
 * @description A Custom Toolbar
 * @since 06.10.2021
 * @license
 * @copyright © 2021 Heidelberg University
 */

// Node Modules

// Assets
import AddIcon from "@mui/icons-material/Add"

// CSS

// Components
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

// Utils / Types / Api


const GridToolbarAddColButton = (props: ButtonProps) =>
    <Button {...props}>
        <AddIcon /> Add Col
    </Button>

// TODO: implement Button in Toolbar to add a col
export const CustomToolbar = (props: GridToolbarContainerProps) =>
    <GridToolbarContainer>
        <GridToolbar {...props} />
        {/* <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport /> */}
        <GridToolbarAddColButton onClick={() => { }} />
    </GridToolbarContainer>