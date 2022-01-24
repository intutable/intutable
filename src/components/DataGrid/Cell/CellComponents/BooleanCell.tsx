import { Checkbox } from "@mui/material"
import { useState } from "react"
import { CellComponent } from "./types"

export const BooleanCell: CellComponent = props => {
    const [checked, setChecked] = useState(false)

    return <Checkbox checked onChange={e => setChecked(e.target.checked)} />
}
