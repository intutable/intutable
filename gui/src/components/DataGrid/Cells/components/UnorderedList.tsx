import { ExposedInputAdornment } from "@datagrid/RowMask/ExposedInputAdornment"
import ListIcon from "@mui/icons-material/List"
import OpenInFullIcon from "@mui/icons-material/OpenInFull"
import {
    Box,
    Chip,
    Divider,
    IconButton,
    ListItemText,
    Menu,
    MenuItem,
    MenuList,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material"
import useTheme from "@mui/system/useTheme"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { useView } from "hooks/useView"
import { useMemo, useRef, useState } from "react"
import { Column, Row } from "types"
import { isJSONObject } from "utils/isJSON"
import { stringToColor } from "utils/stringToColor"
import { Cell } from "../abstract/Cell"
import { ExposedInputProps } from "../abstract/protocols"
import { cellMap } from "../index"
import { MenuAddItemTextField } from "./Select"
import { HelperTooltip } from "./Text"
import ClearIcon from "@mui/icons-material/Clear"
import DeleteIcon from "@mui/icons-material/Delete"
import { useRouter } from "next/router"
import { FormatterProps } from "react-data-grid"

const formatValue = (value: unknown, cellType: string): React.ReactNode => {
    const ctor = cellMap.getCellCtor(cellType)
    const catchEmpty = ctor.catchEmpty
    const deserializer = ctor.deserialize
    const exporter = ctor.export
    const deserialized = catchEmpty(deserializer.bind(ctor), value)
    if (deserialized == null) return <em>Leer</em>
    return exporter(deserialized) as string
}

const formatItems = (list: List): ListItem<undefined>[] => {
    try {
        if (list.format != null) {
            return list.items.map(item => ({
                ...item,
                value: formatValue(item.value, list.format!.cellType) as string,
            }))
        }

        return list.items
    } catch (error) {
        return [{ value: "Fehler: Die Daten konnten nicht geladen werden!" }]
    }
}

export type ListItem<T> = {
    value: string // <- raw value
    url?: string
    props?: T // <- additional data goes here
}

export type List<T = undefined> = {
    format?: { cellType: string }
    items: ListItem<T>[]
}
const isUnorderedList = (value: unknown): value is List =>
    Object.prototype.hasOwnProperty.call(value, "items")

export class UnorderedList extends Cell {
    public brand = "unordered-list"
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
        return isUnorderedList(value)
    }

    static serialize(value: List): string {
        return JSON.stringify(value)
    }
    static deserialize(value: unknown): List {
        if (isUnorderedList(value)) return value
        if (typeof value === "string") {
            try {
                const jsonparsed = JSON.parse(value)
                if (isUnorderedList(jsonparsed)) return jsonparsed
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

    public formatter = (props: FormatterProps<Row>) => {
        const { content, column, row, key } = this.destruct<List | null>(props)

        const theme = useTheme()
        const router = useRouter()

        const [hovering, setHovering] = useState<boolean>(false)
        const modalRef = useRef<HTMLDivElement | null>(null)
        const [menuOpen, setMenuOpen] = useState<boolean>(false)
        const isEmpty = content == null || content?.items.length === 0

        const addListItem = async (value: string) => {
            props.onRowChange({
                ...row,
                [key]: content
                    ? {
                          ...content,
                          items: [...content.items, { value }],
                      }
                    : {
                          items: [{ value: value }],
                      },
            })
        }
        const removeListItem = async (value: string) => {
            props.onRowChange({
                ...row,
                [key]: {
                    ...content,
                    items: content?.items.filter(item => item.value !== value),
                },
            })
        }
        const removeAllListItems = () => {
            props.onRowChange({
                ...row,
                [key]: null,
            })
        }

        const listItems = useMemo(() => {
            if (content == null) return []
            return formatItems(content)
        }, [content])

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
                    <TextField
                        ref={modalRef}
                        size="small"
                        fullWidth
                        value={listItems.map(item => item.value).join(", ")}
                        disabled={this.column.editable === false}
                        onClick={() => setMenuOpen(true)}
                        InputProps={{
                            readOnly: true, // <- Note: this is not the same as `this.isReadonlyComponent`.
                            endAdornment: hovering && (
                                <IconButton size="small" onClick={() => setMenuOpen(true)}>
                                    <OpenInFullIcon sx={{ fontSize: "80%" }} />
                                </IconButton>
                            ),
                            disableUnderline: true,
                        }}
                        sx={{
                            input: { cursor: "pointer" },
                        }}
                        variant="standard"
                    />
                    <Menu
                        id="demo-positioned-menu"
                        aria-labelledby="demo-positioned-button"
                        anchorEl={modalRef.current}
                        open={menuOpen && modalRef.current !== null}
                        onClose={() => setMenuOpen(false)}
                        MenuListProps={{
                            sx: { width: modalRef.current && modalRef.current.offsetWidth },
                        }}
                    >
                        {this.isReadonlyComponent === false && [
                            <MenuItem dense key={"UnorderredList-Menu-Header"}>
                                <ListItemText>
                                    {listItems.length}{" "}
                                    {listItems.length === 1 ? "Eintrag" : "Einträge"}
                                </ListItemText>
                                <Tooltip
                                    arrow
                                    enterDelay={1000}
                                    placement="bottom"
                                    title="Alle Listen-Einträge löschen"
                                >
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            const confirmed = confirm(
                                                "Sollen alle Listen-Einträge gelöscht werden?"
                                            )
                                            if (confirmed) removeAllListItems()
                                        }}
                                        disabled={listItems.length === 0}
                                        sx={{
                                            "&:hover": {
                                                color: theme.palette.error.light,
                                            },
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </MenuItem>,
                            <Divider sx={{ mb: 1 }} key={"UnorderredList-Menu-Header-Divider"} />,
                        ]}

                        <MenuList
                            dense
                            sx={{
                                overflowY: "scroll",
                                maxHeight: "500px",
                            }}
                        >
                            {isEmpty && (
                                <MenuItem>
                                    <em>Keine Listen-Einträge</em>
                                </MenuItem>
                            )}
                            {listItems.map(item => (
                                <MenuItem key={item.value}>
                                    <ListItemText>
                                        &#x2022;{" "}
                                        <Chip
                                            label={item.value}
                                            size="small"
                                            sx={{
                                                color: theme.palette.getContrastText(
                                                    stringToColor(item.value)
                                                ),
                                                bgcolor: stringToColor(item.value),
                                                mr: 0.5,
                                                cursor: item.url && "pointer",
                                            }}
                                            onClick={
                                                item.url ? () => router.push(item.url!) : undefined
                                            }
                                        />
                                    </ListItemText>
                                    <IconButton
                                        size="small"
                                        onClick={() => removeListItem(item.value)}
                                    >
                                        <ClearIcon
                                            fontSize="small"
                                            sx={{
                                                "&:hover": {
                                                    color: theme.palette.error.light,
                                                },
                                            }}
                                        />
                                    </IconButton>
                                </MenuItem>
                            ))}
                        </MenuList>

                        {this.isReadonlyComponent === false && [
                            <Divider sx={{ mt: 1 }} key={"UnorderredList-Footer-Divider"} />,
                            <MenuAddItemTextField
                                key={"UnorderredList-Footer"}
                                onAdd={value => addListItem(value)}
                                label="Eintrag hinzufügen"
                            />,
                        ]}
                    </Menu>
                </Box>
            </>
        )
    }

    public ExposedInput: React.FC<ExposedInputProps<List | null>> = props => {
        const { updateRow } = useRow()
        const { snackError } = useSnacki()
        const theme = useTheme()
        const router = useRouter()

        const modalRef = useRef<HTMLDivElement | null>(null)
        const [menuOpen, setMenuOpen] = useState<boolean>(false)
        const isEmpty = props.content == null || props.content?.items.length === 0

        const addListItem = async (value: string) => {
            try {
                const update: List = props.content
                    ? {
                          ...props.content,
                          items: [...props.content.items, { value }],
                      }
                    : {
                          items: [{ value: value }],
                      }

                await updateRow(props.column, props.row, update)
            } catch (e) {
                snackError("Der Wert konnte nicht hinzugefügt werden")
            }
        }
        const removeListItem = async (value: string) => {
            try {
                const update = props.content
                    ? {
                          ...props.content,
                          items: props.content.items.filter(listItem => listItem.value !== value),
                      }
                    : null
                if (update == null) return
                await updateRow(props.column, props.row, update)
            } catch (e) {
                snackError("Der Wert konnte nicht entfernt werden")
            }
        }
        const removeAllListItems = async () => {
            try {
                await updateRow(props.column, props.row, null)
            } catch (e) {
                snackError("Die Werte konnten nicht entfernt werden")
            }
        }

        const listItems = useMemo(() => {
            if (props.content == null) return []
            return formatItems(props.content)
        }, [props.content])

        return (
            <>
                <TextField
                    ref={modalRef}
                    size="small"
                    fullWidth
                    value={listItems.map(item => item.value).join(", ")}
                    disabled={this.column.editable === false}
                    label={props.label}
                    required={props.required}
                    onClick={() => setMenuOpen(true)}
                    InputProps={{
                        readOnly: true, // <- Note: this is not the same as `this.isReadonlyComponent`.
                        startAdornment: <ExposedInputAdornment column={this.column} />,
                        endAdornment: (
                            <>
                                <IconButton size="small" onClick={() => setMenuOpen(true)}>
                                    <OpenInFullIcon sx={{ fontSize: "80%" }} />
                                </IconButton>
                                <HelperTooltip text={props.tooltip} />
                            </>
                        ),
                    }}
                    sx={{
                        input: { cursor: "pointer" },
                        ...props.forwardSX,
                    }}
                    placeholder={
                        props.label == null && props.required
                            ? props.placeholder + "*"
                            : props.placeholder
                    }
                    error={props.required && isEmpty}
                    helperText={props.required && isEmpty ? "Pflichtfeld" : undefined}
                    {...props.forwardProps}
                />
                <Menu
                    id="demo-positioned-menu"
                    aria-labelledby="demo-positioned-button"
                    anchorEl={modalRef.current}
                    open={menuOpen && modalRef.current !== null}
                    onClose={() => setMenuOpen(false)}
                    MenuListProps={{
                        sx: { width: modalRef.current && modalRef.current.offsetWidth },
                    }}
                >
                    {this.isReadonlyComponent === false && [
                        <MenuItem dense key={"UnorderredList-Menu-Header"}>
                            <ListItemText>
                                {listItems.length} {listItems.length === 1 ? "Eintrag" : "Einträge"}
                            </ListItemText>
                            <Tooltip
                                arrow
                                enterDelay={1000}
                                placement="bottom"
                                title="Alle Listen-Einträge löschen"
                            >
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        const confirmed = confirm(
                                            "Sollen alle Listen-Einträge gelöscht werden?"
                                        )
                                        if (confirmed) removeAllListItems()
                                    }}
                                    disabled={listItems.length === 0}
                                    sx={{
                                        "&:hover": {
                                            color: theme.palette.error.light,
                                        },
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </MenuItem>,
                        <Divider sx={{ mb: 1 }} key={"UnorderredList-Menu-Header-Divider"} />,
                    ]}

                    <MenuList
                        dense
                        sx={{
                            overflowY: "scroll",
                            maxHeight: "500px",
                        }}
                    >
                        {isEmpty && (
                            <MenuItem>
                                <em>Keine Listen-Einträge</em>
                            </MenuItem>
                        )}
                        {listItems.map(item => (
                            <MenuItem key={item.value}>
                                <ListItemText>
                                    &#x2022;{" "}
                                    <Chip
                                        label={item.value}
                                        size="small"
                                        sx={{
                                            color: theme.palette.getContrastText(
                                                stringToColor(item.value)
                                            ),
                                            bgcolor: stringToColor(item.value),
                                            mr: 0.5,
                                            cursor: item.url && "pointer",
                                        }}
                                        onClick={
                                            item.url ? () => router.push(item.url!) : undefined
                                        }
                                    />
                                </ListItemText>
                                <IconButton size="small" onClick={() => removeListItem(item.value)}>
                                    <ClearIcon
                                        fontSize="small"
                                        sx={{
                                            "&:hover": {
                                                color: theme.palette.error.light,
                                            },
                                        }}
                                    />
                                </IconButton>
                            </MenuItem>
                        ))}
                    </MenuList>

                    {this.isReadonlyComponent === false && [
                        <Divider sx={{ mt: 1 }} key={"UnorderredList-Footer-Divider"} />,
                        <MenuAddItemTextField
                            key={"UnorderredList-Footer"}
                            onAdd={value => addListItem(value)}
                            label="Eintrag hinzufügen"
                        />,
                    ]}
                </Menu>
            </>
        )
    }
}
