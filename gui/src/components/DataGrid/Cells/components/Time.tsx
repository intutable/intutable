import { Box, TextFieldProps } from "@mui/material"
import { TextField } from "@mui/material"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { TimePicker } from "@mui/x-date-pickers"
import deLocale from "date-fns/locale/de"
import { useState } from "react"
import { FormatterProps } from "react-data-grid"
import { Column, Row } from "types"
import { TempusCell } from "../abstract/TempusCell"
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled"
import { ExposedInputProps } from "../abstract/protocols"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { ExposedInputAdornment } from "@datagrid/RowMask/ExposedInputAdornment"
import { TimePickerProps } from "@mui/lab"
import { HelperTooltip } from "./Text"

export class Time extends TempusCell {
    public brand = "time"
    public label = "Time"
    public icon = AccessTimeFilledIcon

    constructor(column: Column.Serialized) {
        super(column)
        this.setEditorOptions({
            renderFormatter: true,
        })
    }

    static export(value: Date): string {
        return value.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    public editor = () => null

    public formatter = (props: FormatterProps<Row>) => {
        const { row, key, content: _content } = this.destruct<Date | null>(props)
        const [content, setContent] = useState(_content)

        const handleChange = (date: Date | null) => {
            if (date === null) return erase()
            if (Time.isValid(date) === false) return

            props.onRowChange({
                ...row,
                [key]: date,
            })
        }

        // erases the content and sets the value to default (=> nothing)
        const erase = () => {
            props.onRowChange({
                ...row,
                [key]: "",
            })
        }

        return (
            <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={deLocale}
                localeText={{
                    openPreviousView: "Stunde setzen",
                    openNextView: "Minuten setzen",
                    clearButtonLabel: "Löschen",
                    cancelButtonLabel: "Abbrechen",
                    okButtonLabel: "OK",
                    todayButtonLabel: "Jetzt",
                    // start: "Start",
                    // end: "Ende",
                }}
            >
                <TimePicker
                    showToolbar
                    value={content}
                    onChange={date => setContent(date)} // only update the state, but do not update the actual db (only on blur – see below)
                    onAccept={handleChange} // update the db
                    ampm={false}
                    disabled={this.column.editable === false}
                    readOnly={this.isReadonlyComponent}
                    renderInput={params => (
                        <TextField
                            {...params}
                            onBlur={() => handleChange(content)} // now actually update the db
                            size="small"
                            variant="standard"
                            fullWidth
                            disabled={this.column.editable === false}
                            sx={{
                                m: 0,
                                mt: 0.5,
                                p: 0,
                                height: "100%",
                                maxHeight: "100%",
                            }}
                            InputProps={{
                                disableUnderline: true,
                                readOnly: this.isReadonlyComponent,
                                ...params.InputProps,
                            }}
                        />
                    )}
                    componentsProps={{
                        actionBar: {
                            actions: ["clear", "today", "accept"],
                        },
                    }}
                />
            </LocalizationProvider>
        )
    }

    public ExposedInput: React.FC<ExposedInputProps<number | null, TimePickerProps<unknown>>> =
        props => {
            const { updateRow } = useRow()
            const { snackError } = useSnacki()

            const [content, setContent] = useState(props.content)
            const isEmpty = content == null

            const handleChange = async (value: number | null) => {
                if (Time.isValid(value)) setContent(value)
                try {
                    await updateRow(props.column, props.row, value)
                } catch (e) {
                    snackError("Der Wert konnte nicht geändert werden")
                }
            }

            /**
             * required
             * tooltip
             * placeholder
             * suppressed label
             */

            return (
                <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={deLocale}
                    localeText={{
                        openPreviousView: "Stunde setzen",
                        openNextView: "Minuten setzen",
                        clearButtonLabel: "Löschen",
                        cancelButtonLabel: "Abbrechen",
                        okButtonLabel: "OK",
                        todayButtonLabel: "Jetzt",
                        // start: "Start",
                        // end: "Ende",
                    }}
                >
                    <TimePicker
                        showToolbar
                        value={content}
                        onChange={handleChange}
                        label={props.label}
                        renderInput={renderProps => (
                            <TextField
                                size="small"
                                fullWidth
                                required={props.required}
                                label={props.label}
                                placeholder={
                                    props.label == null && props.required
                                        ? props.placeholder + "*"
                                        : props.placeholder
                                }
                                error={props.required && isEmpty}
                                helperText={props.required && isEmpty ? "Pflichtfeld" : undefined}
                                {...renderProps}
                            />
                        )}
                        disabled={this.column.editable === false}
                        componentsProps={{
                            actionBar: {
                                actions: ["clear", "today", "accept"],
                            },
                        }}
                        readOnly={this.isReadonlyComponent}
                        InputProps={{
                            readOnly: this.isReadonlyComponent,
                            startAdornment: <ExposedInputAdornment column={this.column} />,
                            endAdornment: <HelperTooltip text={props.tooltip} />,
                        }}

                        // sx={props.forwardSX}
                        // {...props.forwardProps}
                    />
                </LocalizationProvider>
            )
        }
}
