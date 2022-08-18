import { FormatterComponent } from "@datagrid/Formatter"
import { Box } from "@mui/material"
import { Row } from "types"
import * as React from "react"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { TimePicker } from "@mui/x-date-pickers/TimePicker"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker"
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker"
import deLocale from "date-fns/locale/de"
import Input from "@datagrid/CellContentType/inputs/Input"

export const TimeFormatter: FormatterComponent = props => {
    const { row, column } = props

    const key = column.key as keyof Row
    const isEmpty = row[key] == null || row[key] === ""
    const content =
        isEmpty || isNaN(row[key] as number)
            ? null
            : Date.parse(row[key] as string)
    console.log("content:", content)

    const handleChange = (date: Date | null) => {
        const isValid = date instanceof Date && !isNaN(date.getTime())
        const deleted = isEmpty === false && date == null
        if (date == null || isValid === false) return
        console.log("new value", date)
        props.onRowChange({
            ...row,
            [key]: date.getTime(),
        })
    }

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
            }}
        >
            {content == null ? (
                <Box onClick={() => {}}>/</Box>
            ) : (
                <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={deLocale}
                >
                    <TimePicker
                        value={content}
                        onChange={handleChange}
                        ampm={false}
                        renderInput={params => {
                            // return <Input
                            const { inputRef, inputProps, InputProps } = params

                            // return (
                            //     <Input
                            //         value={content}
                            //         endAdornment={InputProps?.endAdornment}
                            //         ref={inputRef}
                            //         {...inputProps}
                            //     />
                            // )

                            return <TextField {...params} />
                        }}
                        componentsProps={{
                            actionBar: {
                                actions: ["clear", "accept"],
                            },
                        }}
                    />
                </LocalizationProvider>
            )}
        </Box>
    )
}

export default TimeFormatter
