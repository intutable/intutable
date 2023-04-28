import { Box, Checkbox, FormControlLabel } from "@mui/material"
import React from "react"
import { FormatterProps } from "react-data-grid"
import { Column, Row } from "types"
import ToggleOnIcon from "@mui/icons-material/ToggleOn"
import { Cell } from "../abstract/Cell"
import { ExposedInputProps } from "../abstract/protocols"
import { useSnacki } from "hooks/useSnacki"
import { useRow } from "hooks/useRow"
import { ExposedInputIcon } from "@datagrid/RowMask/ExposedInputAdornment"
import { HelperTooltip } from "./Text"

export class Bool extends Cell {
    public brand = "boolean"
    public label = "Boolean"
    public icon = ToggleOnIcon
    public canBeUserPrimaryKey = false

    constructor(column: Column.Serialized) {
        super(column)
        this.setEditorOptions({
            renderFormatter: true,
        })
    }

    public editor = () => null

    static isValid(value: unknown): boolean {
        if (value == null || value === "") return true

        if (typeof value === "string") return value === "true" || value === "false"

        if (typeof value === "number") return value === 1 || value === 0

        return typeof value === "boolean"
    }

    static serialize(value: boolean): string {
        return value.toString()
    }
    static deserialize(value: unknown): boolean {
        if (typeof value === "boolean") return value
        if (value === 1 || value === 0) return value === 1
        if (value === "1" || value === "0") return value === "1"
        if (value === "true" || value === "false") return value === "true"
        throw new Error(`Could not deserialize value: ${value}`)
    }

    static export(value: boolean): string {
        return value ? "wahr" : "falsch"
    }
    static unexport(value: "wahr" | "falsch"): boolean {
        if (value !== "wahr" && value !== "falsch")
            throw new RangeError("Boolean Cell Debug Error: value is not a boolean")

        return value === "wahr"
    }

    public formatter = (props: FormatterProps<Row>) => {
        const { row, key, content } = this.destruct<boolean>(props)

        const [value, setValue] = React.useState(content)

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.checked)
            if (e.target.checked !== content)
                props.onRowChange({
                    ...row,
                    [key]: Boolean(e.target.checked),
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
                <Checkbox
                    checked={value}
                    onChange={this.isReadonlyComponent ? undefined : handleChange}
                    readOnly={this.isReadonlyComponent}
                    disabled={this.column.editable === false || this.isReadonlyComponent}
                />
            </Box>
        )
    }

    public ExposedInput: React.FC<ExposedInputProps<boolean>> = props => {
        const { updateRow } = useRow()
        const { snackError } = useSnacki()

        const [value, setValue] = React.useState(props.content)
        const hasChanged = (): boolean => value !== props.content

        const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.checked)
            if (hasChanged()) {
                try {
                    await updateRow(props.column, props.row, e.target.checked)
                } catch (e) {
                    snackError("Der Wert konnte nicht geändert werden")
                }
            }
        }

        /**
         * not implemented
         * • required (useless)
         * • placeholder (useless)
         * • error (useless)
         */

        return (
            <>
                <ExposedInputIcon column={this.column} />
                <FormControlLabel
                    disabled={this.column.editable === false || this.isReadonlyComponent}
                    control={
                        <Checkbox
                            checked={value}
                            onChange={this.isReadonlyComponent ? undefined : handleChange}
                            readOnly={this.isReadonlyComponent}
                            disabled={this.column.editable === false || this.isReadonlyComponent}
                        />
                    }
                    label={
                        <>
                            {props.label}
                            <HelperTooltip text={props.tooltip} />
                        </>
                    }
                />
            </>
        )
    }
}
