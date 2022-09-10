import { Box, Checkbox } from "@mui/material"
import React from "react"
import { FormatterProps } from "react-data-grid"
import { Row } from "types"
import Cell from "../Cell"

export class Bool extends Cell {
    readonly brand = "boolean"
    label = "Boolean"

    editor = () => null

    isValid(value: unknown): boolean {
        return (
            (typeof value === "number" && (value === 1 || value === 0)) ||
            typeof value === "boolean"
        )
    }

    export(value: unknown): string {
        const bool = value as 1 | 0 | boolean
        return bool ? "wahr" : "falsch"
    }

    formatter = (props: FormatterProps<Row>) => {
        const { row, key, content: _content } = this.destruct(props)
        const content = _content === "true"

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.checked !== content)
                props.onRowChange({
                    ...row,
                    [key]: Boolean(e.target.checked).toString(),
                })
        }

        return (
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Checkbox checked={content} onChange={handleChange} />
            </Box>
        )
    }
}
