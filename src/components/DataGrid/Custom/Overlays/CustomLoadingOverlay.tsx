/**
 * @author Heidelberg University
 * @version 0.1.0
 * @file CustomLoadingOverlay.tsx
 * @description Custom Loading Overlay
 * @since 06.10.2021
 * @license
 * @copyright © 2021 Heidelberg University
 */

// Node Modules

// Assets

// CSS

// Components
import {
    LinearProgress,
} from "@mui/material"
import {
    GridOverlay,
} from "@mui/x-data-grid"

// Utils / Types / Api

export const CustomLoadingOverlay = () =>
    <GridOverlay>
        <div style={{ position: 'absolute', top: 0, width: '100%' }}>
            <LinearProgress />
        </div>
    </GridOverlay>