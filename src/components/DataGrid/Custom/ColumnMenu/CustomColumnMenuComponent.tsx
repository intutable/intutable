/**
 * @author Heidelberg University
 * @version 0.1.0
 * @file CustomColumnMenuComponent.tsx
 * @description A Custom ColumnMenu
 * @since 06.10.2021
 * @license
 * @copyright © 2021 Heidelberg University
 */

// Node Modules

// Assets

// CSS

// Components
import {
    ButtonProps,
    Button,
    MenuItem,
    MenuItemProps
} from "@mui/material"
import {
    GridColumnMenu,
    GridColumnMenuContainer,
    GridColumnsMenuItem
} from "@mui/x-data-grid"

// Utils / Types / Api
import type {
    GridColumnMenuProps,
} from "@mui/x-data-grid"



const ColumnMenuDeleteColButton = (props: MenuItemProps) =>
    <MenuItem {...props}>
        TEST
    </MenuItem>


export const CustomColumnMenuComponent = (props: GridColumnMenuProps) => {

    const { hideMenu, currentColumn, color, ...other } = props;

    return (
        <GridColumnMenuContainer
            hideMenu={hideMenu}
            currentColumn={currentColumn}
            {...other}
        >
            <GridColumnMenu
                hideMenu={hideMenu}
                currentColumn={currentColumn}
                {...other}
            />
            {/* TODO: implement deletion of col here */}
            {/* <GridColumnsMenuItem column={currentColumn} onClick={() => { }}>TEST</GridColumnsMenuItem> */}
            <ColumnMenuDeleteColButton onClick={() => { }} />
        </GridColumnMenuContainer>
    )

}