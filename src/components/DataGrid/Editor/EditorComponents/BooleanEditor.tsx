import { Checkbox } from "@mui/material"
import { useState } from "react"
import type { Editor } from "."

export const BooleanEditor: Editor = props => {
    const [checked, setChecked] = useState(false)

    return <Checkbox checked onChange={e => setChecked(e.target.checked)} />
}
