import { Checkbox } from "@mui/material"
import { useState } from "react"
import { EditorComponent } from "../../types/EditorComponent"

export const BooleanEditor: EditorComponent = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [checked, setChecked] = useState(false)

    return <Checkbox checked onChange={e => setChecked(e.target.checked)} />
}
