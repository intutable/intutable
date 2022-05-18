import { Checkbox } from "@mui/material"
import { useState } from "react"
import { EditorComponent } from "../../types/EditorComponent"

export const BooleanEditor: EditorComponent = props => {
    const [checked, setChecked] = useState(false)

    return <Checkbox checked onChange={e => setChecked(e.target.checked)} />
}
