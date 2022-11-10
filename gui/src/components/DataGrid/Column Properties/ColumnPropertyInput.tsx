import InfoIcon from "@mui/icons-material/Info"
import {
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import React from "react"

type ColumnPropertyInputType = "text" | "switch" | "select"
type ColumnPropertyInputTypeMap = {
    text: string
    switch: boolean
    select: {
        value: string
        /** [label, value] */
        options: [string, string][]
    }
}
type ColumnPropertyInputValue_onChangeReturnMap = {
    text: string
    switch: boolean
    select: string
}

type ColumnPropertyInputProps<TYPE extends ColumnPropertyInputType> = {
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
    ) => Promise<void> | void
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
            <Typography
                variant="caption"
                sx={{
                    mt: -0.3,
                    fontStyle: "italic",
                    color: theme.palette.grey[700],
                    fontSize: "60%",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                {props.label}
                {props.helperText && (
                    <Tooltip arrow title={props.helperText} placement="right">
                        <InfoIcon
                            sx={{
                                ml: 0.4,
                                fontSize: 10,
                            }}
                        />
                    </Tooltip>
                )}
            </Typography>
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

const TextInput: React.FC<ColumnPropertyInputProps<"text">> = props => (
    <TextField
        value={props.value}
        onChange={e => props.onChange(e.target.value as string)}
    />
)

const SwitchInput: React.FC<ColumnPropertyInputProps<"switch">> = props => (
    <FormControlLabel
        label={props.label}
        labelPlacement="start"
        control={
            <Switch
                checked={props.value}
                onChange={e => props.onChange(e.target.checked)}
            />
        }
    />
)

const SelectInput: React.FC<ColumnPropertyInputProps<"select">> = props => (
    <FormControl>
        <InputLabel>{props.label}</InputLabel>
        <Select
            value={props.value.value}
            onChange={e => props.onChange(e.target.value)}
        >
            {props.value.options.map(([label, value]) => (
                <MenuItem value={value} key={value}>
                    {label}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
)
