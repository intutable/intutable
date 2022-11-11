import InfoIcon from "@mui/icons-material/Info"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import {
    FormControlLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Box,
    Typography,
} from "@mui/material"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import { useTheme } from "@mui/material/styles"
import React from "react"
import CheckIcon from "@mui/icons-material/Check"
import { TooltipIcon } from "components/TooltipIcon"

export type ColumnPropertyInputType = "text" | "switch" | "select"
export type ColumnPropertyInputTypeMap = {
    text: string
    switch: boolean
    select: {
        value: string
        /** [brand, label] */
        options: [string, string][]
    }
}
export type ColumnPropertyInputValue_onChangeReturnMap = {
    text: string
    switch: boolean
    select: string
}

export type ColumnPropertyInputProps<TYPE extends ColumnPropertyInputType> = {
    /** name of the property */
    label: string
    /** tooltip */
    helperText?: string
    /** type of the data structure */
    type: TYPE
    /** value */
    value: ColumnPropertyInputTypeMap[TYPE]
    /** controlled input update method */
    onChange: (
        value: ColumnPropertyInputValue_onChangeReturnMap[TYPE]
    ) => unknown
}

export const ColumnPropertyInput = <T extends ColumnPropertyInputType>(
    props: ColumnPropertyInputProps<T>
) => {
    const theme = useTheme()

    return (
        <Stack
            sx={{
                my: 2,
            }}
        >
            {chooseInput(props)}
            {props.type !== "switch" && (
                <Typography
                    variant="caption"
                    sx={{
                        mt: 0.5,
                        fontStyle: "italic",
                        color: theme.palette.grey[700],
                        fontSize: "60%",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {props.label}
                    {props.helperText && (
                        <Tooltip
                            arrow
                            title={props.helperText}
                            placement="right"
                        >
                            <InfoIcon
                                sx={{
                                    ml: 0.4,
                                    fontSize: 10,
                                }}
                            />
                        </Tooltip>
                    )}
                </Typography>
            )}
        </Stack>
    )
}

const chooseInput = <T extends ColumnPropertyInputType>(
    props: ColumnPropertyInputProps<T>
) => {
    switch (props.type) {
        case "text":
            return (
                <TextInput
                    {...(props as unknown as ColumnPropertyInputProps<"text">)}
                />
            )
        case "switch":
            return (
                <SwitchInput
                    {...(props as unknown as ColumnPropertyInputProps<"switch">)}
                />
            )
        case "select":
            return (
                <SelectInput
                    {...(props as unknown as ColumnPropertyInputProps<"select">)}
                />
            )
        default:
            return null
    }
}

const TextInput: React.FC<ColumnPropertyInputProps<"text">> = props => {
    const [value, setValue] = React.useState(props.value)

    return (
        <TextField
            variant="standard"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => {
                if (e.key === "Enter") props.onChange(value)
            }}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            onClick={() => props.onChange(value)}
                            onMouseDown={e => e.preventDefault()}
                            edge="end"
                            size="small"
                        >
                            <CheckIcon fontSize="small" />
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    )
}

const SwitchInput: React.FC<ColumnPropertyInputProps<"switch">> = props => {
    const [checked, setChecked] = React.useState(props.value)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked)
        props.onChange(event.target.checked)
    }

    return (
        <FormControlLabel
            label={props.label}
            labelPlacement="start"
            control={<Switch checked={checked} onChange={handleChange} />}
        />
    )
}

const SelectInput: React.FC<ColumnPropertyInputProps<"select">> = props => (
    <Select
        variant="standard"
        value={props.value.value}
        onChange={e => props.onChange(e.target.value)}
    >
        {props.value.options.map(([brand, label]) => (
            <MenuItem value={brand} key={brand}>
                {label}
            </MenuItem>
        ))}
    </Select>
)
