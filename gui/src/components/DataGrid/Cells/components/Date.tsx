import { Box } from "@mui/material"
import TextField from "@mui/material/TextField"
import { DatePicker } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import deLocale from "date-fns/locale/de"
import { useState } from "react"
import { FormatterProps } from "react-data-grid"
import { Row } from "types"
import { TempusCell } from "../abstract/TempusCell"
import DateRangeIcon from "@mui/icons-material/DateRange"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { ExposedInputProps } from "../abstract/protocols"

export class DateCell extends TempusCell {
    readonly brand = "date"
    label = "Date"
    icon = DateRangeIcon

    export(value: Date): string {
        return value.toLocaleDateString("de-DE", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        })
    }

    editor = () => null

    formatter = (props: FormatterProps<Row>) => {
        const { row, key, content: _content } = this.destruct<Date | null>(props)
        const [content, setContent] = useState(_content)

        const handleChange = (date: Date | null) => {
            if (date === null) return erase()
            if (this.isValid(date) === false) return

            props.onRowChange({
                ...row,
                [key]: date,
            })
        }

        // erases the content and sets the value to default (=> nothing)
        const erase = () => {
            props.onRowChange({
                ...row,
                [key]: null,
            })
        }

        return (
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                }}
            >
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
                    <DatePicker
                        showToolbar
                        value={content}
                        onChange={date => setContent(date)} // only update the state, but do not update the actual db (only on blur – see below)
                        onAccept={handleChange} // update the db
                        renderInput={params => (
                            <TextField
                                {...params}
                                onBlur={() => handleChange(content)} // now actually update the db
                                size="small"
                                variant="standard"
                                fullWidth
                                sx={{
                                    m: 0,
                                    mt: 0.5,
                                    p: 0,
                                    height: "100%",
                                    maxHeight: "100%",
                                }}
                                InputProps={{
                                    disableUnderline: true,
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
            </Box>
        )
    }

    public ExposedInput: React.FC<ExposedInputProps<number | null>> = props => {
        const { getRowId, updateRow } = useRow()
        const { snackError } = useSnacki()

        const [content, setContent] = useState(props.content)

        const handleChange = async (value: number | null) => {
            if (this.isValid(value)) setContent(value)
            try {
                await updateRow(props.column, getRowId(props.row), value)
            } catch (e) {
                snackError("Der Wert konnte nicht geändert werden")
            }
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
                <DatePicker
                    showToolbar
                    value={content}
                    onChange={handleChange}
                    renderInput={props => <TextField {...props} />}
                    componentsProps={{
                        actionBar: {
                            actions: ["clear", "today", "accept"],
                        },
                    }}
                />
            </LocalizationProvider>
        )
    }
}
