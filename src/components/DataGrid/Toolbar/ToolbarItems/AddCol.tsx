import type { PredefinedToolbarItem } from "../types"
import { Button, useTheme } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"

type AddColProps = {
    addCol: <C>(col: C) => void
}

/**
 * Toolbar Item for adding cols to the data grid.
 */
const AddCol: PredefinedToolbarItem<AddColProps> = props => {
    return (
        <Button startIcon={<AddIcon />} onClick={props.addCol}>
            Add Col
        </Button>
    )
}
export default AddCol
