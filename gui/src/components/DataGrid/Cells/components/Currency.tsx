import { Box } from "@mui/material"
import React from "react"
import { EditorProps, FormatterProps } from "react-data-grid"
import { Row } from "types"
import Cell from "../Cell"

export class Currency extends Cell {
    readonly brand = "currency"
    label = "Currency"

    isValid(value: unknown): boolean {
        return typeof value === "number"
    }

    export(value: unknown): string {
        return value + "€"
    }

    editor = (props: EditorProps<Row>) => {
        const { row, key, content } = this.destruct(props)

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
            props.onRowChange({
                ...row,
                [key]: e.target.value,
            })

        return (
            <this.Input
                onChange={handleChange}
                type="number"
                onBlur={() => props.onClose(true)}
                value={content}
            />
        )
    }

    formatter = (props: FormatterProps<Row>) => {
        const { content } = this.destruct(props)

        return (
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                }}
            >
                <>
                    {content}
                    {content && " €"}
                </>
            </Box>
        )
    }
}
