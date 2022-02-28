import Typography, { TypographyProps } from "@mui/material/Typography"
import { useState } from "react"

type EditableTypographyProps = {
    editor?: {
        handleUpdate: (newValue: string) => void
    }
    children: string
}

export const EditableTypography: React.FC<
    EditableTypographyProps & TypographyProps
> = props => {
    const { editor, children, ...muiprops } = props
    const [editing, setEditing] = useState<boolean>(false)
    const [value, setValue] = useState<string>(children)

    if (editing) return null

    return (
        <Typography
            {...muiprops}
            onDoubleClick={() => setEditing(true)}
            sx={{
                cursor: "text",
            }}
        >
            {children}
        </Typography>
    )
}
