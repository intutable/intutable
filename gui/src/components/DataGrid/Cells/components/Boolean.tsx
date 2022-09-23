import { Box, Checkbox } from "@mui/material"
import React from "react"
import { FormatterProps } from "react-data-grid"
import { Row } from "types"
import Cell from "../abstract/Cell"

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

    parse(content: "true" | "false" | boolean | 1 | 0): boolean {
        if (typeof content === "boolean") return content
        return content === "true" || content === 1
    }

    export(value: unknown): string {
        if (
            (typeof value === "boolean" ||
                value === "true" ||
                value === "false") === false
        )
            throw new RangeError(
                "Boolean Cell Debug Error: value is not a boolean"
            ) // only for debugging

        const bool = this.parse(value as "true" | "false" | boolean)
        return bool ? "wahr" : "falsch"
    }

    formatter = (props: FormatterProps<Row>) => {
        const { row, key, content } = this.destruct<boolean>(props)

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
