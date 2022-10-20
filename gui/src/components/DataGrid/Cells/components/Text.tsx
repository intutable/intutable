import { Box } from "@mui/material"
import { useState } from "react"
import Cell, { ExposedInputProps } from "../abstract/Cell"

export class Text extends Cell {
    readonly brand = "string"
    label = "Text"

    public ExposedInput = (props: ExposedInputProps) => {
        const [focused, setFocused] = useState<boolean>(false)

        const Editor = this.editor!
        const Formatter = this.formatter

        return <Box>{focused ? <Editor /> : <Formatter />}</Box>
    }

    public update = (props: any) => {}
}
