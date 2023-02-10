import { ExposedInputAdornment } from "@datagrid/RowMask/ExposedInputAdornment"
import LinkIcon from "@mui/icons-material/Attachment"
import { Box, IconButton, InputAdornment, TextField, TextFieldProps, Tooltip } from "@mui/material"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { useEffect, useState } from "react"
import { EditorProps, FormatterProps } from "react-data-grid"
import { Row } from "types"
import { Cell } from "../abstract/Cell"
import { ExposedInputProps } from "../abstract/protocols"
import { HelperTooltip } from "./Text"

export class Hyperlink extends Cell {
    public brand = "hyperlink"
    public label = "Hyperlink"
    public icon = LinkIcon

    static isValid(value: unknown): boolean {
        if (value == null || value === "") return true
        if (typeof value !== "string") return false

        try {
            new URL(value)
            return true
        } catch (e) {
            return false
        }
    }

    public editor = (props: EditorProps<Row>) => {
        const { row, key, content } = this.destruct(props)

        const [input, setInput] = useState(content ?? "")

        // BUG: this causes a loop (useEffect + updating state = bad), replace
        useEffect(() => {
            if (Hyperlink.isValid(input)) {
                props.onRowChange({
                    ...row,
                    [key]: input,
                })
            }
        }, [input, key, props, row])

        return <this.Input onChange={e => setInput(e.target.value)} onBlur={() => props.onClose(true)} value={input} />
    }

    public formatter = (props: FormatterProps<Row>) => {
        const { content } = this.destruct<string | null | undefined>(props)

        if (Hyperlink.isValid(content) === false || content == null || content.length < 1) return null

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
                <Tooltip title={content} arrow placement="top">
                    <IconButton size="small" onClick={() => open(content)} color="success">
                        <LinkIcon
                            sx={{
                                fontSize: "90%",
                            }}
                        />
                    </IconButton>
                </Tooltip>
            </Box>
        )
    }

    public ExposedInput: React.FC<ExposedInputProps<string | null, TextFieldProps>> = props => {
        const { updateRow } = useRow()
        const { snackError } = useSnacki()

        const [value, setValue] = useState(props.content ?? "")
        const isEmpty = value == null || value === ""

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)

        const handleBlur = async () => {
            if (Hyperlink.isValid(value) === false) return
            try {
                await updateRow(props.column, props.row, value)
            } catch (e) {
                snackError("Der Wert konnte nicht geändert werden")
            }
        }

        return (
            <TextField
                size="small"
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        e.preventDefault()
                        handleBlur()
                    }
                }}
                value={value}
                disabled={this.column.editable === false}
                label={props.label}
                fullWidth
                required={props.required}
                InputProps={{
                    endAdornment: (
                        <>
                            <InputAdornment
                                position="end"
                                onClick={() => props.content && open(props.content)}
                                sx={{
                                    cursor: "pointer",
                                }}
                            >
                                <this.icon fontSize="small" color="success" />
                            </InputAdornment>
                            <HelperTooltip text={props.tooltip} />
                        </>
                    ),
                    readOnly: this.isReadonlyComponent,
                    startAdornment: <ExposedInputAdornment column={this.column} />,
                }}
                placeholder={props.label == null && props.required ? props.placeholder + "*" : props.placeholder}
                error={Hyperlink.isValid(value) === false || (props.required && isEmpty)}
                helperText={
                    Hyperlink.isValid(value) === false
                        ? "Keine valide URI!"
                        : props.required && isEmpty
                        ? "Pflichtfeld"
                        : undefined
                }
                sx={props.forwardSX}
                {...props.forwardProps}
            />
        )
    }
}
