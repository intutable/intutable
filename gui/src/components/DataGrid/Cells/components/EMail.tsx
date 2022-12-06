import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead"
import { Box, IconButton, InputAdornment, TextField, Tooltip } from "@mui/material"
import { useEffect, useState } from "react"
import { EditorProps, FormatterProps } from "react-data-grid"
import { Row } from "types"
import { isValidEMailAddress } from "utils/isValidEMailAddress"
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail"
import { Cell } from "../abstract/Cell"
import { ExposedInputProps } from "../abstract/protocols"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { ExposedInputAdornment } from "@datagrid/RowMask/ExposedInputAdornment"

export class EMail extends Cell {
    public brand = "email"
    public label = "E-Mail"
    public icon = AlternateEmailIcon

    static isValid(value: unknown): boolean {
        return value == null || value === "" || isValidEMailAddress(value)
    }

    public editor = (props: EditorProps<Row>) => {
        const { row, key, content } = this.destruct(props)

        const [input, setInput] = useState(content ?? "")

        // BUG: this causes a loop (useEffect + updating state = bad), replace
        useEffect(() => {
            if (EMail.isValid(input)) {
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

        if (EMail.isValid(content) === false || content == null || content.length < 1) return null

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
                    <IconButton size="small" href={`mailto:${content}`} color="success">
                        <MarkEmailReadIcon
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
        const { updateRow } = useRow()
        const { snackError } = useSnacki()

        const [value, setValue] = useState(props.content ?? "")

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)

        const handleBlur = async () => {
            if (EMail.isValid(value) === false) return
            try {
                await updateRow(props.column, props.row, value)
            } catch (e) {
                snackError("Der Wert konnte nicht geändert werden")
            }
        }

        return (
            <TextField
                error={EMail.isValid(value) === false}
                size="small"
                onChange={handleChange}
                onBlur={handleBlur}
                value={value}
                disabled={this.column.editable === false}
                InputProps={{
                    endAdornment: (
                        <InputAdornment
                            position="end"
                            onClick={() => props.content && open(`mailto:${props.content}`)}
                            sx={{
                                cursor: "pointer",
                            }}
                        >
                            <this.icon fontSize="small" color="success" />
                        </InputAdornment>
                    ),
                    readOnly: this.isReadonlyComponent,
                    startAdornment: <ExposedInputAdornment column={this.column} />,
                }}
                {...props.forwardProps}
                sx={props.forwardSX}
            />
        )
    }
}
