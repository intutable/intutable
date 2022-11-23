import LinkIcon from "@mui/icons-material/Attachment"
import { Box, IconButton, InputAdornment, TextField, Tooltip } from "@mui/material"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { useEffect, useState } from "react"
import { EditorProps, FormatterProps } from "react-data-grid"
import { Row } from "types"
import { Cell } from "../abstract/Cell"
import { ExposedInputProps } from "../abstract/protocols"

export class Hyperlink extends Cell {
    readonly brand = "hyperlink"
    label = "Hyperlink"
    icon = LinkIcon

    isValid(value: unknown): boolean {
        if (value == null || value === "") return true
        if (typeof value !== "string") return false

        try {
            new URL(value)
            return true
        } catch (e) {
            return false
        }
    }

    editor = (props: EditorProps<Row>) => {
        const { row, key, content } = this.destruct(props)

        const [input, setInput] = useState(content ?? "")

        useEffect(() => {
            if (this.isValid(input)) {
                props.onRowChange({
                    ...row,
                    [key]: input,
                })
            }
        }, [input, key, props, row])

        return <this.Input onChange={e => setInput(e.target.value)} onBlur={() => props.onClose(true)} value={input} />
    }

    formatter = (props: FormatterProps<Row>) => {
        const { content } = this.destruct<string | null | undefined>(props)

        if (this.isValid(content) === false || content == null || content.length < 1) return null

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
                <Tooltip title={content!} arrow placement="top">
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

    public ExposedInput: React.FC<ExposedInputProps<string | null>> = props => {
        const { getRowId, updateRow } = useRow()
        const { snackError } = useSnacki()

        const [value, setValue] = useState(props.content ?? "")

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)

        const handleBlur = async () => {
            if (this.isValid(value) === false) return
            try {
                await updateRow(props.column, props.row, value)
            } catch (e) {
                snackError("Der Wert konnte nicht geändert werden")
            }
        }

        return (
            <TextField
                error={this.isValid(value) === false}
                size="small"
                onChange={handleChange}
                onBlur={handleBlur}
                value={value}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <this.icon fontSize="small" />
                        </InputAdornment>
                    ),
                }}
            />
        )
    }
}
