import ListIcon from "@mui/icons-material/List"
import AddOptionIcon from "@mui/icons-material/PlaylistAdd"
import {
    Chip,
    Divider,
    FormControl,
    FormHelperText,
    IconButton,
    MenuItem,
    Select as MuiSelect,
    TextField,
    Typography,
} from "@mui/material"
import useTheme from "@mui/system/useTheme"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { useView } from "hooks/useView"
import { useState } from "react"
import { Column } from "types"
import { isJSONObject } from "utils/isJSON"
import { stringToColor } from "utils/stringToColor"
import { Cell } from "../abstract/Cell"
import { ExposedInputProps } from "../abstract/protocols"
import { cellMap } from "../index"
import { HelperTooltip } from "./Text"

export type ListItem<T> = {
    value: string
    url?: string
    props?: T // <- additional data here
}
export type List<T extends Record<string, unknown> = Record<string, unknown>> = {
    format?: { cellType: string }
    items: ListItem<T>[]
}

const formatItems = (list: List): string[] => {
    try {
        if (list.format) {
            const exporter = cellMap.get(list.format.cellType)?.export
            if (exporter == null) throw new Error("Could not get export method")
            return list.items.map(item => exporter(item.value) as string)
        }

        return list.items.map(item => item.value)
    } catch (error) {
        return ["Fehler: Die Daten konnten nicht geladen werden!"]
    }
}

export class ListCell extends Cell {
    public brand = "list"
    public label = "Liste"
    public icon = ListIcon
    public canBeUserPrimaryKey = false

    constructor(column: Column.Serialized) {
        super(column)
        this.setEditorOptions({
            renderFormatter: true,
        })
    }

    static isValid(value: unknown): boolean {
        return isJSONObject(value) && Object.prototype.hasOwnProperty.call(value, "items")
    }

    static serialize(value: List): string {
        return JSON.stringify(value)
    }
    static deserialize(value: unknown): string[] {
        if (typeof value === "string") {
            try {
                const jsonparsed = JSON.parse(value)
                if (isJSONObject(jsonparsed)) return jsonparsed
                // eslint-disable-next-line no-empty
            } catch (_) {}
        }
        throw new Error(`Could not deserialize value: ${value}`)
    }

    static export(list: List): string {
        return formatItems(list).join(";")
    }
    static unexport(value: string): List {
        const items = value.split(";")
        return {
            items: items.map(item => ({ value: item })),
        }
    }

    public editor = () => null
    public formatter = () => null
    // public formatter = (props: FormatterProps<Row>) => {
    //     const { content, column, row, key } = this.destruct<string[] | null>(props)
    //     const isEmpty = content == null || content.length === 0

    //     const [hovering, setHovering] = useState<boolean>(false)
    //     const modalRef = useRef<HTMLElement | null>(null)
    //     const [open, setOpen] = useState<boolean>(false)
    //     const openModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    //         e.preventDefault()
    //         e.stopPropagation()
    //         setOpen(true)
    //     }
    //     const closeModal = () => setOpen(false)

    //     const addChip = (value: string) => {
    //         if (Cell.isEmpty(value)) return
    //         if (content?.includes(value)) return
    //         props.onRowChange({
    //             ...row,
    //             [key]: content ? [...content, value] : [value],
    //         })
    //         closeModal()
    //     }
    //     const removeChip = (value: string) => {
    //         if (content == null) return
    //         props.onRowChange({
    //             ...row,
    //             [key]: content.filter(option => option !== value),
    //         })
    //         closeModal()
    //     }

    //     const { data } = useView()

    //     return (
    //         <>
    //             <Box
    //                 onMouseEnter={() => setHovering(true)}
    //                 onMouseLeave={() => setHovering(false)}
    //                 sx={{
    //                     width: "100%",
    //                     height: "100%",
    //                     display: "inline-flex",
    //                     justifyContent: "flex-start",
    //                     alignContent: "center",
    //                     alignItems: "center",
    //                     whiteSpace: "nowrap",
    //                 }}
    //                 ref={modalRef}
    //             >
    //                 {isEmpty ? (
    //                     <>
    //                         {hovering &&
    //                             this.column.editable &&
    //                             this.isReadonlyComponent === false && (
    //                                 <IconButton size="small" onClick={openModal}>
    //                                     <AddIcon fontSize="small" />
    //                                 </IconButton>
    //                             )}
    //                     </>
    //                 ) : (
    //                     <>
    //                         <Box
    //                             sx={{
    //                                 flex: 1,
    //                                 overflow: "hidden",
    //                                 textOverflow: "ellipsis",
    //                             }}
    //                         >
    //                             {isEmpty === false &&
    //                                 content.map(chip => (
    //                                     <ChipItem
    //                                         label={chip}
    //                                         key={chip}
    //                                         onDelete={
    //                                             this.column.editable
    //                                                 ? () => removeChip(chip)
    //                                                 : undefined
    //                                         }
    //                                     />
    //                                 ))}
    //                         </Box>
    //                         {hovering &&
    //                             this.column.editable &&
    //                             this.isReadonlyComponent === false && (
    //                                 <IconButton size="small" onClick={openModal}>
    //                                     <KeyboardArrowDownIcon fontSize="small" />
    //                                 </IconButton>
    //                             )}
    //                     </>
    //                 )}
    //             </Box>

    //             {modalRef.current !== null && (
    //                 <MultiSelectMenu
    //                     open={open}
    //                     anchor={modalRef.current}
    //                     options={list}
    //                     addOption={addChip}
    //                     onClose={closeModal}
    //                 />
    //             )}
    //         </>
    //     )
    // }

    public ExposedInput: React.FC<ExposedInputProps<List | null>> = props => {
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

        const [input, setInput] = useState<string>("")
        const isEmpty = props.content == null || props.content.items.length === 0
        // const noLabel = props.label == null || props.label === ""

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const disallowNewSelectValues = (props.column as any).disallowNewSelectValues ?? false

        return (
            <FormControl
                size="small"
                disabled={this.column.editable === false}
                // error={props.required && isEmpty}
                fullWidth
                // required={props.required} // <- forces a '*' to appear within in the label or placeholder
            >
                {/* <InputLabel id="Select-InputLabel">{props.label}</InputLabel> */}
                <MuiSelect
                    labelId="Select-InputLabel"
                    // label={props.label}
                    value={props.content?.items ?? []}
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
                        <MenuItem key="Select-Menu-Input">
                            <TextField
                                label="Option hinzufügen"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                size="small"
                                fullWidth
                                onKeyDown={e => {
                                    e.stopPropagation()
                                    if (e.key === "Enter")
                                        handleChange(
                                            props.content ? [...props.content, input] : [input]
                                        )
                                }}
                            />
                            <IconButton
                                size="small"
                                sx={{ ml: 1 }}
                                onClick={e => {
                                    e.stopPropagation()
                                    if (input === "") return
                                    handleChange(
                                        props.content ? [...props.content, input] : [input]
                                    )
                                }}
                                disabled={input === ""}
                            >
                                <AddOptionIcon
                                    fontSize="small"
                                    color={input === "" ? "disabled" : "primary"}
                                />
                            </IconButton>
                        </MenuItem>,
                    ]}
                </MuiSelect>
                <FormHelperText>
                    {props.required && isEmpty ? "Pflichtfeld" : undefined}
                </FormHelperText>
            </FormControl>
        )
    }
}
