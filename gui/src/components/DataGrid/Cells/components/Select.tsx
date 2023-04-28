import AddIcon from "@mui/icons-material/Add"
import CheckIcon from "@mui/icons-material/Check"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import {
    Box,
    Chip,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    MenuList,
    Stack,
    TextField,
    Select as MuiSelect,
    ListItemText,
    FormControl,
    InputLabel,
    FormHelperText,
    Typography,
} from "@mui/material"
import { useTheme } from "@mui/system"
import { useView } from "hooks/useView"
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react"
import { FormatterProps } from "react-data-grid"
import { Column, Row } from "types"
import { stringToColor } from "utils/stringToColor"
import BookmarkIcon from "@mui/icons-material/Bookmark"
import { Cell } from "../abstract/Cell"
import { ExposedInputProps } from "../abstract/protocols"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import ClearIcon from "@mui/icons-material/Clear"
import AddOptionIcon from "@mui/icons-material/PlaylistAdd"
import { HelperTooltip } from "./Text"

export const ChipItem: React.FC<{
    label?: string | null
    onDelete?: () => void
}> = ({ label, onDelete }) => {
    const theme = useTheme()
    const [hovering, setHovering] = useState<boolean>(false)

    if (label == null) return null
    const color = stringToColor(label)

    return (
        <Chip
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            label={label}
            size="small"
            onDelete={hovering ? onDelete : undefined}
            sx={{
                color: theme.palette.getContrastText(color),
                bgcolor: color,
                mr: 0.5,
            }}
        />
    )
}

export type SelectMenuProps = {
    open: boolean
    /** @default false */
    disallowAddingValues?: boolean
    anchor: HTMLElement
    options: string[]
    addOption: (option: string) => void
    onClose: () => void
}
export const SelectMenu: React.FC<SelectMenuProps> = props => {
    const [input, setInput] = useState<string>("")

    const disallowAddingValues = props.disallowAddingValues ?? false

    return (
        <Menu
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
            open={props.open}
            anchorEl={props.anchor}
            onClose={props.onClose}
            PaperProps={{
                sx: {
                    boxShadow: "10px 10px 20px 0px rgba(0,0,0,0.2)",
                },
            }}
        >
            {disallowAddingValues === false && [
                <MenuItem key={"menu-439587394857239457"}>
                    <TextField
                        label="Option hinzufügen"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        size="small"
                        onKeyDown={e => {
                            if (e.key === "Enter") props.addOption(input)
                        }}
                    />
                    <IconButton size="small" sx={{ ml: 1 }} onClick={() => props.addOption(input)}>
                        <CheckIcon fontSize="small" color="primary" />
                    </IconButton>
                </MenuItem>,
                <Divider key={"divider-329847913456834"} />,
            ]}
            <MenuList
                sx={{
                    maxHeight: "200px",
                    overflowY: "scroll",
                }}
            >
                {props.options.map((item, index) => (
                    <MenuItem
                        key={index}
                        data-value={item}
                        onClick={e => props.addOption(e.currentTarget.dataset["value"] as string)}
                    >
                        <ChipItem label={item} />
                    </MenuItem>
                ))}
            </MenuList>
        </Menu>
    )
}

export const MenuAddItemTextField: React.FC<{
    label?: string
    onAdd: (value: string) => void
}> = props => {
    const [input, setInput] = useState<string>("")

    const handleEnter = (e: React.KeyboardEvent<HTMLDivElement>) => {
        e.stopPropagation()
        if (input === "") return
        if (e.key === "Enter") props.onAdd(input)
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation()
        if (input === "") return
        props.onAdd(input)
    }

    return (
        <MenuItem key="Select-Menu-Input">
            <TextField
                label={props.label ?? "Option hinzufügen"}
                value={input}
                onChange={e => setInput(e.target.value)}
                size="small"
                fullWidth
                onKeyDown={handleEnter}
            />
            <IconButton size="small" sx={{ ml: 1 }} onClick={handleClick} disabled={input === ""}>
                <AddOptionIcon fontSize="small" color={input === "" ? "disabled" : "primary"} />
            </IconButton>
        </MenuItem>
    )
}

export class Select extends Cell {
    public brand = "select"
    public label = "Auswahlliste"
    public icon = BookmarkIcon
    public canBeUserPrimaryKey = false

    constructor(column: Column.Serialized) {
        super(column)
        this.setEditorOptions({
            renderFormatter: true,
        })
    }

    public editor = () => null

    /** Returns a list of all available options in this column (the values of other chips) */
    private getAvailableOptions(
        column: Column.Deserialized,
        rows: Row[],
        self?: string | null
    ): string[] {
        const options = rows
            .map(row => row[column.key])
            .filter(option => Cell.isEmpty(option) === false) // remove empty values
        const optionsWithoutSelf = (
            self == null ? options : options.filter(option => self !== option)
        ) as string[] // remove self from list
        const uniqueOptions = new Set(optionsWithoutSelf) // remove duplicates from list
        return [...uniqueOptions] // return sorted
    }

    public formatter = (props: FormatterProps<Row>) => {
        const { content, column, row, key } = this.destruct<string | null | undefined>(props)
        const isEmpty = content == null || content === ""

        const [hovering, setHovering] = useState<boolean>(false)
        const modalRef = useRef(null)
        const [open, setOpen] = useState<boolean>(false)
        const openModal = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen(true)
        }
        const closeModal = () => setOpen(false)

        const changeOption = (value: string) => {
            props.onRowChange({
                ...row,
                [key]: value,
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
                                <ChipItem
                                    label={content}
                                    onDelete={
                                        this.column.editable && this.isReadonlyComponent === false
                                            ? () => changeOption("")
                                            : undefined
                                    }
                                />
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
                    <SelectMenu
                        open={open}
                        anchor={modalRef.current}
                        options={list}
                        addOption={changeOption}
                        onClose={closeModal}
                    />
                )}
            </>
        )
    }

    public ExposedInput: React.FC<ExposedInputProps<string | null>> = props => {
        const { updateRow } = useRow()
        const { snackError } = useSnacki()
        const theme = useTheme()

        const changeOption = async (value: string) => {
            try {
                const val = value === "" ? null : value
                if (val === props.content) return
                await updateRow(props.column, props.row, val)
            } catch (e) {
                snackError("Der Wert konnte nicht geändert werden")
            }
        }

        const { data } = useView()
        const list = useMemo(
            () => (data ? this.getAvailableOptions(props.column, data.rows, props.content) : []),
            [data, props.column, props.content]
        )

        const isEmpty = props.content == null || props.content === ""
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
                    value={props.content ?? ""}
                    onChange={e => changeOption(e.target.value)}
                    displayEmpty={noLabel}
                    renderValue={value => {
                        if (isEmpty)
                            return (
                                <Typography>
                                    {props.label == null && props.required
                                        ? props.placeholder + "*"
                                        : props.placeholder}
                                </Typography>
                            )

                        return (
                            <Chip
                                label={value}
                                size="small"
                                sx={{
                                    color: theme.palette.getContrastText(stringToColor(value)),
                                    bgcolor: stringToColor(value),
                                    mr: 0.5,
                                }}
                            />
                        )
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

                    // variant="standard" // causes annoying css
                    // disableUnderline
                >
                    <MenuItem value="">
                        <em>Keine Auswahl</em>
                    </MenuItem>
                    {[props.content as string, ...list]
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
                            onAdd={value => changeOption(value)}
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
