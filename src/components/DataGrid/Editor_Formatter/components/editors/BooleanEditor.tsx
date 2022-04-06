import { Checkbox } from "@mui/material"
import { useState } from "react"
import { Editor } from "../../types/Editor"

export const BooleanEditor: Editor = props => {
    const [checked, setChecked] = useState(false)

    return <Checkbox checked onChange={e => setChecked(e.target.checked)} />
}
