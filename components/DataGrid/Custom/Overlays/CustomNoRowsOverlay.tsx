/**
 * @author Heidelberg University
 * @version 0.1.0
 * @file CustomNoRowsOverlay.tsx
 * @description Custom Overlay shown when no rows loaded
 * @since 06.10.2021
 * @license
 * @copyright © 2021 Heidelberg University
 */

// Node Modules

// Assets
import WarningIcon from "@mui/icons-material/Warning"

// CSS

// Components
import {
    GridOverlay,
} from "@mui/x-data-grid"

// Utils / Types / Api

export const CustomNoRowsOverlay = () =>
    <GridOverlay>
        <WarningIcon />
        <div>No Data Found</div>
    </GridOverlay>

