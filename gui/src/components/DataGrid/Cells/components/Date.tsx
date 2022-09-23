import { Box } from "@mui/material"
import TextField from "@mui/material/TextField"
import { DatePicker } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { isValid as isValidDate } from "date-fns"
import deLocale from "date-fns/locale/de"
import { useState } from "react"
import { FormatterProps } from "react-data-grid"
import { Row } from "types"
import Cell from "../abstract/Cell"

export class DateCell extends Cell {
    readonly brand = "date"
    label = "Date"

    editor = () => null

    isValid(value: unknown): boolean {
        return isValidDate(value)
    }

    parse(value: string | null | undefined | Date): Date | null {
        // case nullish
        if (typeof value === "undefined" || value === null || value === "")
            return null
        // case Date
        if (value instanceof Date) return value
        const parsed = Number.parseInt(value as string)
        // case invalid
        if (this.isValid(parsed) === false) return null
        // case timestamp
        return new Date(parsed)
    }

    export(value: unknown): string | void {
        const parsed = this.parse(value as string)
        if (parsed == null) return
        return parsed.toLocaleDateString("de-DE")
    }

    formatter = (props: FormatterProps<Row>) => {
        /**
         * MUIs Time Picker component requires a `value`.
         * This can either be a Date object or null.
         *
         * null will be displayed as a placeholder "hh:mm"
         */

        const {
            row,
            key,
            content: _content,
        } = this.destruct<Date | null>(props)
        const [content, setContent] = useState<Date | null>(_content)

        const handleChange = (date: Date | null) => {
            if (date === null) return erase()
            if (this.isValid(date) === false) return

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
}
