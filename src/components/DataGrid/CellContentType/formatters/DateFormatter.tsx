import { FormatterComponent } from "@datagrid/Cells/types/FormatterComponent"
import { Box } from "@mui/material"
import TextField from "@mui/material/TextField"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import deLocale from "date-fns/locale/de"
import { useState } from "react"
import { Row } from "types"
import { isValidTime } from "../validators/isValidTime"

export const DateFormatter: FormatterComponent = props => {
    const { row, column } = props

    /**
     * MUIs Time Picker component requires a `value`.
     * This can either be a Date object or null.
     *
     * null will be displayed as a placeholder "hh:mm"
     */

    const key = column.key as keyof Row
    const isValid = isValidTime(Number.parseInt(row[key] as string))
    const [content, setContent] = useState<Date | null>(
        isValid ? new Date(Number.parseInt(row[key] as string)) : null
    )

    const handleChange = (date: Date | null) => {
        if (date === null) return erase()
        if (isValidTime(date) === false) return

        // BUG: do not update when the user is still editing the input

        props.onRowChange({
            ...row,
            [key]: date.getTime().toString(),
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

export default DateFormatter
