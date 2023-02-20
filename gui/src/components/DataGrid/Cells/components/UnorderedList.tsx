import ClearIcon from "@mui/icons-material/Clear"
import DeleteIcon from "@mui/icons-material/Delete"
import { useRouter } from "next/router"
import { FormatterProps } from "react-data-grid"
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
} from "@mui/material"
import useTheme from "@mui/system/useTheme"

import {
    UnorderedListCellContent as List,
    UnorderedListCellContentItem as ListItem,
} from "@shared/types/gui"
import { ExposedInputAdornment } from "@datagrid/RowMask/ExposedInputAdornment"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { useMemo, useRef, useState } from "react"
import { Column, Row } from "types"
import { stringToColor } from "utils/stringToColor"

import { Cell } from "../abstract/Cell"
import { ExposedInputProps } from "../abstract/protocols"
import { cellMap } from "../index"
import { MenuAddItemTextField } from "./Select"
import { HelperTooltip } from "./Text"

const isUnorderedList = (value: unknown): value is List =>
    Object.prototype.hasOwnProperty.call(value, "items")

const formatValue = (value: unknown, cellType: string): React.ReactNode => {
    const ctor = cellMap.getCellCtor(cellType)
    const catchEmpty = ctor.catchEmpty
    const deserializer = ctor.deserialize
    const exporter = ctor.export
    const deserialized = catchEmpty(deserializer.bind(ctor), value)
    if (deserialized == null) return "Leer"
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
        const { content: rawContent, row, key } = this.destruct<List | null>(props)

        const theme = useTheme()
        const router = useRouter()

        const [hovering, setHovering] = useState<boolean>(false)
        const modalRef = useRef<HTMLDivElement | null>(null)
        const [menuOpen, setMenuOpen] = useState<boolean>(false)
        const [content] = useState<List | null>(
            rawContent?.items.every(item => item.value == null) ? null : rawContent
        )
        const isEmpty = content === null || content?.items.length === 0

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
                    <UnorderedListMenu
                        menuOpen={menuOpen}
                        modalRef={modalRef}
                        onClose={() => setMenuOpen(false)}
                        self={this}
                        removeAllListItems={removeAllListItems}
                        removeListItem={removeListItem}
                        addListItem={addListItem}
                        listItems={listItems}
                        isEmpty={isEmpty}
                    />
                </Box>
            </>
        )
    }

    public ExposedInput: React.FC<ExposedInputProps<List | null>> = props => {
        const { content: rawContent } = props
        const { updateRow } = useRow()
        const { snackError } = useSnacki()
        const theme = useTheme()
        const router = useRouter()

        const modalRef = useRef<HTMLDivElement | null>(null)
        const [menuOpen, setMenuOpen] = useState<boolean>(false)
        const [content] = useState<List | null>(
            rawContent?.items.every(item => item.value == null) ? null : rawContent
        )
        const isEmpty = content == null || content?.items.length === 0

        const addListItem = async (value: string) => {
            try {
                const update: List = content
                    ? {
                          ...content,
                          items: [...content.items, { value }],
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
                const update = content
                    ? {
                          ...content,
                          items: content.items.filter(listItem => listItem.value !== value),
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
            if (content == null) return []
            return formatItems(content)
        }, [content])

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
                <UnorderedListMenu
                    menuOpen={menuOpen}
                    modalRef={modalRef}
                    onClose={() => setMenuOpen(false)}
                    self={this}
                    removeAllListItems={removeAllListItems}
                    removeListItem={removeListItem}
                    addListItem={addListItem}
                    listItems={listItems}
                    isEmpty={isEmpty}
                />
            </>
        )
    }
}

type UnorderedListMenuProps = {
    menuOpen: boolean
    modalRef: React.RefObject<HTMLDivElement>
    onClose: () => void
    readonly self: UnorderedList
    removeListItem: (value: string) => void
    removeAllListItems: () => void
    addListItem: (value: string) => void
    listItems: ListItem<undefined>[]
    isEmpty: boolean
}
const UnorderedListMenu: React.FC<UnorderedListMenuProps> = props => {
    const {
        menuOpen,
        modalRef,
        self,
        removeAllListItems,
        removeListItem,
        addListItem,
        listItems,
        isEmpty,
    } = props
    const theme = useTheme()
    const router = useRouter()

    return (
        <Menu
            id="demo-positioned-menu"
            aria-labelledby="demo-positioned-button"
            anchorEl={modalRef.current}
            open={menuOpen && modalRef.current !== null}
            onClose={props.onClose}
            MenuListProps={{
                sx: { width: modalRef.current && modalRef.current.offsetWidth },
            }}
        >
            {self.isReadonlyComponent === false && [
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
                                    color: theme.palette.getContrastText(stringToColor(item.value)),
                                    bgcolor: stringToColor(item.value),
                                    mr: 0.5,
                                    cursor: item.url && "pointer",
                                }}
                                onClick={item.url ? () => router.push(item.url!) : undefined}
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

            {self.isReadonlyComponent === false && [
                <Divider sx={{ mt: 1 }} key={"UnorderredList-Footer-Divider"} />,
                <MenuAddItemTextField
                    key={"UnorderredList-Footer"}
                    onAdd={value => addListItem(value)}
                    label="Eintrag hinzufügen"
                />,
            ]}
        </Menu>
    )
}
