import AddIcon from "@mui/icons-material/Add"
import BookmarksIcon from "@mui/icons-material/Bookmarks"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import AddOptionIcon from "@mui/icons-material/PlaylistAdd"
import {
    Box,
    Chip,
    Divider,
    FormControl,
    FormHelperText,
    IconButton,
    InputLabel,
    MenuItem,
    Select as MuiSelect,
    TextField,
    Typography,
} from "@mui/material"
import useTheme from "@mui/system/useTheme"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { useView } from "hooks/useView"
import { useMemo, useRef, useState } from "react"
import { FormatterProps } from "react-data-grid"
import { Column, Row } from "types"
import { stringToColor } from "utils/stringToColor"
import { Cell } from "../abstract/Cell"
import { ExposedInputProps } from "../abstract/protocols"
import { ChipItem, MenuAddItemTextField, SelectMenu as MultiSelectMenu } from "./Select"
import { HelperTooltip } from "./Text"

export class MultiSelect extends Cell {
    public brand = "multiselect"
    public label = "Mehrfach-Auswahlliste"
    public icon = BookmarksIcon
    public canBeUserPrimaryKey = false

    constructor(column: Column.Serialized) {
        super(column)
        this.setEditorOptions({
            renderFormatter: true,
        })
    }

    static isValid(value: unknown): boolean {
        return Array.isArray(value) && value.every(v => typeof v === "string")
    }

    static serialize(value: string[]): string {
        return JSON.stringify(value)
    }
    static deserialize(value: unknown): string[] {
        if (Array.isArray(value)) return value
        if (typeof value === "string") {
            try {
                const jsonparsed = JSON.parse(value)
                if (Array.isArray(jsonparsed)) return jsonparsed
                // eslint-disable-next-line no-empty
            } catch (_) {}
        }
        throw new Error(`Could not deserialize value: ${value}`)
    }

    static export(value: string[]): string {
        return value.join(";")
    }
    static unexport(value: string): string[] {
        return value.split(";")
    }

    public editor = () => null

    /** Returns a list of all available options in this column (the values of other chips) */
    private getAvailableOptions(
        column: Column.Deserialized,
        rows: Row[],
        self?: string[] | null
    ): string[] {
        const options = rows
            .map(row => row[column.key])
            .flat()
            .filter(option => Cell.isEmpty(option) === false) // remove empty values
        const optionsWithoutSelf = (
            self == null
                ? options
                : options.filter(option => self.includes(option as string) === false)
        ) as string[] // remove self from list
        const uniqueOptions = new Set(optionsWithoutSelf) // remove duplicates from list
        return [...uniqueOptions] // return sorted
    }

    public formatter = (props: FormatterProps<Row>) => {
        const { content, column, row, key } = this.destruct<string[] | null>(props)
        const isEmpty = content == null || content.length === 0

        const [hovering, setHovering] = useState<boolean>(false)
        const modalRef = useRef(null)
        const [open, setOpen] = useState<boolean>(false)
        const openModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen(true)
        }
        const closeModal = () => setOpen(false)

        const addChip = (value: string) => {
            if (Cell.isEmpty(value)) return
            if (content?.includes(value)) return
            props.onRowChange({
                ...row,
                [key]: content ? [...content, value] : [value],
            })
            closeModal()
        }
        const removeChip = (value: string) => {
            if (content == null) return
            props.onRowChange({
                ...row,
                [key]: content.filter(option => option !== value),
            })
            closeModal()
        }

        const { data } = useView()
        const list = useMemo(
            () => (data ? this.getAvailableOptions(column, data.rows, content) : []),
            [data, column, content]
        )

        const showSelectMenuButton =
            (hovering || open) && this.column.editable && this.isReadonlyComponent === false

        return (
            <>
                <Box
                    onMouseEnter={() => setHovering(true)}
                    onMouseLeave={() => setHovering(false)}
                    sx={{
                        width: "100%",
                        height: "100%",
                        display: "inline-flex",
                        justifyContent: "flex-start",
                        alignContent: "center",
                        alignItems: "center",
                        whiteSpace: "nowrap",
                    }}
                >
                    {isEmpty ? (
                        <>
                            {showSelectMenuButton && (
                                <IconButton size="small" onClick={openModal} ref={modalRef}>
                                    <AddIcon fontSize="small" />
                                </IconButton>
                            )}
                        </>
                    ) : (
                        <>
                            <Box
                                sx={{
                                    flex: 1,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {isEmpty === false &&
                                    content.map(chip =>
                                        chip ? (
                                            <ChipItem
                                                label={chip.toString()}
                                                key={chip}
                                                onDelete={
                                                    this.column.editable
                                                        ? () => removeChip(chip)
                                                        : undefined
                                                }
                                            />
                                        ) : (
                                            <></>
                                        )
                                    )}
                            </Box>
                            {showSelectMenuButton && (
                                <IconButton size="small" onClick={openModal} ref={modalRef}>
                                    <KeyboardArrowDownIcon fontSize="small" />
                                </IconButton>
                            )}
                        </>
                    )}
                </Box>

                {modalRef.current !== null && (
                    <MultiSelectMenu
                        open={open}
                        anchor={modalRef.current}
                        options={list}
                        addOption={addChip}
                        onClose={closeModal}
                    />
                )}
            </>
        )
    }

    public ExposedInput: React.FC<ExposedInputProps<string[] | null>> = props => {
        const { updateRow } = useRow()
        const { snackError } = useSnacki()
        const theme = useTheme()

        const handleChange = async (selected: string[]) => {
            try {
                const reset = selected.includes("--KEINE-AUSWAHL--")
                await updateRow(props.column, props.row, reset ? null : selected)
            } catch (e) {
                snackError("Der Wert konnte nicht geändert werden")
            }
        }

        const { data } = useView()
        const list = useMemo(
            () => (data ? this.getAvailableOptions(props.column, data.rows, props.content) : []),
            [data, props.column, props.content]
        )

        const isEmpty =
            props.content == null ||
            Array.isArray(props.content) === false ||
            props.content.length === 0
        const noLabel = props.label == null || props.label === ""

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const disallowNewSelectValues = (props.column as any).disallowNewSelectValues ?? false

        return (
            <FormControl
                size="small"
                disabled={this.column.editable === false}
                error={props.required && isEmpty}
                fullWidth
                // required={props.required} // <- forces a '*' to appear within in the label or placeholder
            >
                <InputLabel id="Select-InputLabel">{props.label}</InputLabel>
                <MuiSelect
                    labelId="Select-InputLabel"
                    label={props.label}
                    value={props.content ?? []}
                    onChange={e => handleChange(e.target.value as string[])}
                    multiple
                    multiline
                    displayEmpty={noLabel}
                    renderValue={values => {
                        if (isEmpty)
                            return (
                                <Typography>
                                    {props.label == null && props.required
                                        ? props.placeholder + "*"
                                        : props.placeholder}
                                </Typography>
                            )

                        return values.map(value => (
                            <Chip
                                key={value}
                                label={value}
                                size="small"
                                sx={{
                                    color: theme.palette.getContrastText(stringToColor(value)),
                                    bgcolor: stringToColor(value),
                                    mr: 0.5,
                                }}
                            />
                        ))
                    }}
                    size="small"
                    error={props.required && isEmpty} // BUG: https://github.com/mui/material-ui/issues/29821
                    placeholder={
                        props.label == null && props.required
                            ? props.placeholder + "*"
                            : props.placeholder
                    }
                    readOnly={this.isReadonlyComponent}
                    required={props.required}
                    disabled={this.column.editable === false}
                    endAdornment={<HelperTooltip text={props.tooltip} />}
                    // variant="standard"
                    // disableUnderline
                >
                    <MenuItem value="--KEINE-AUSWAHL--">
                        <em>Keine Auswahl</em>
                    </MenuItem>
                    {list
                        .concat(props.content ?? [])
                        .filter(i => i !== null)
                        .map(option => (
                            <MenuItem key={option} value={option}>
                                <Chip
                                    label={option}
                                    size="small"
                                    sx={{
                                        color: theme.palette.getContrastText(stringToColor(option)),
                                        bgcolor: stringToColor(option),
                                        mr: 0.5,
                                    }}
                                />
                            </MenuItem>
                        ))}
                    {disallowNewSelectValues === false && [
                        <Divider key="Select-Menu-Divider" />,
                        <MenuAddItemTextField
                            key="Select-Menu-Input"
                            onAdd={value => (props.content ? [...props.content, value] : [value])}
                        />,
                    ]}
                </MuiSelect>
                <FormHelperText>
                    {props.required && isEmpty ? "Pflichtfeld" : undefined}
                </FormHelperText>
            </FormControl>
        )
    }
}
