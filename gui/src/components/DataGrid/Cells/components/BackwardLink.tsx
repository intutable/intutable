/**
 * A cell type for backward links and lookups, which are a 1:n mapping between rows. A
 * cell shows one column value for every row that is linked. The individual values are
 * formatted according to the cell type of the parent column, which means the link/lookup
 * must have the parent's cellType attached in an extra prop.
 * A backward lookup can be based on another backward link/lookup, leading to nested
 * lists. These are displayed in full detail if the nesting is only one level deep
 * (list of list of raw values) according to the following pattern:
 * linkedRow1;        linkedRow2;  ... linkedRowN
 * item1,item2,item3; item4,item5; ... eltn-1,eltn
 *
 * If the nesting is more than two levels deep, the sub-lists are flattened and the result
 * displayed according to the above pattern.
 */
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
} from "@mui/material"
import useTheme from "@mui/system/useTheme"
import { useRouter } from "next/router"
import { FormatterProps } from "react-data-grid"

import { ExposedInputAdornment } from "@datagrid/RowMask/ExposedInputAdornment"
import {
    BackwardLinkCellContent as List,
    BackwardLinkCellContentItem as ListItem,
} from "@shared/types/gui"
import { useMemo, useRef, useState } from "react"
import { Column, Row } from "types"
import { stringToColor } from "utils/stringToColor"

import { Cell } from "../abstract/Cell"
import { ExposedInputProps } from "../abstract/protocols"
import { cellMap } from "../index"
import { HelperTooltip } from "./Text"

type BacklinkItemProps = { _id: number }
type FormattedListItem<T> = Omit<ListItem<T>, "value"> & { value: string }

const isList = (value: unknown): value is List =>
    Object.prototype.hasOwnProperty.call(value, "items")

const flattenListItems = <T,>(items: ListItem<T>[]): string[] =>
    items
        .map(item => (typeof item.value === "string" ? item.value : flattenListItems(item.value)))
        .flat()

const formatValue = (value: unknown, cellType: string): React.ReactNode => {
    const ctor = cellMap.getCellCtor(cellType)
    const catchEmpty = ctor.catchEmpty
    const deserializer = ctor.deserialize
    const exporter = ctor.export
    const deserialized = catchEmpty(deserializer.bind(ctor), value)
    if (deserialized == null) return "Leer"
    return exporter(deserialized) as string
}

const formatItems = <T,>(list: List<T>): FormattedListItem<T>[] => {
    try {
        if (list.format != null) {
            return list.items.map(item => {
                let displayComponent: string
                if (typeof item.value === "string")
                    displayComponent = formatValue(item.value, list.format!.cellType) as string
                else if (item.value.map(subItem => typeof subItem === "string"))
                    displayComponent = item.value
                        .map(subItem => formatValue(subItem.value, list.format!.cellType) as string)
                        .join(",")
                else
                    displayComponent = flattenListItems(item.value)
                        .map(subItem => formatValue(subItem, list.format!.cellType) as string)
                        .join(",")
                return { ...item, value: displayComponent }
            })
        } else throw TypeError("cannot format a list with no format property")
    } catch (error) {
        console.log(error)
        console.dir(error)
        console.log(JSON.stringify(list))
        return [{ value: "Fehler: Die Daten konnten nicht formatiert werden!" }]
    }
}

export class BackwardLink extends Cell {
    public brand = "backward-link"
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
        return isList(value)
    }

    static serialize(value: List): string {
        return JSON.stringify(value)
    }
    static deserialize(value: unknown): List {
        if (isList(value)) return value
        if (typeof value === "string") {
            try {
                const jsonparsed = JSON.parse(value)
                if (isList(jsonparsed)) return jsonparsed
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
        const { content: rawContent } = this.destruct<List | null>(props)

        const [hovering, setHovering] = useState<boolean>(false)
        const modalRef = useRef<HTMLDivElement | null>(null)
        const [menuOpen, setMenuOpen] = useState<boolean>(false)
        const [content] = useState<List | null>(
            rawContent?.items.every(item => item.value == null) ? null : rawContent
        )
        const isEmpty = content === null || content?.items.length === 0

        const listItems = useMemo(() => {
            if (!content) return []
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
                        value={listItems.map(item => item.value).join("; ")}
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
                    <ListItemsDropdown
                        menuOpen={menuOpen}
                        modalRef={modalRef}
                        onClose={() => setMenuOpen(false)}
                        self={this}
                        listItems={listItems}
                        isEmpty={isEmpty}
                    />
                </Box>
            </>
        )
    }

    public ExposedInput: React.FC<ExposedInputProps<List | null>> = props => {
        const { content: rawContent } = props

        const modalRef = useRef<HTMLDivElement | null>(null)
        const [menuOpen, setMenuOpen] = useState<boolean>(false)
        const [content] = useState<List | null>(
            rawContent?.items.every(item => item.value == null) ? null : rawContent
        )
        const isEmpty = content == null || content?.items.length === 0

        const listItems = useMemo(() => {
            if (!content) return []
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
                <ListItemsDropdown
                    menuOpen={menuOpen}
                    modalRef={modalRef}
                    onClose={() => setMenuOpen(false)}
                    self={this}
                    listItems={listItems}
                    isEmpty={isEmpty}
                />
            </>
        )
    }
}

type ListItemsDropdownProps = {
    menuOpen: boolean
    modalRef: React.RefObject<HTMLDivElement>
    onClose: () => void
    readonly self: BackwardLink
    listItems: FormattedListItem<BacklinkItemProps>[]
    isEmpty: boolean
}
const ListItemsDropdown: React.FC<ListItemsDropdownProps> = props => {
    const { menuOpen, modalRef, self, listItems, isEmpty } = props
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
                    <MenuItem key={item.props?._id || item.value}>
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
                    </MenuItem>
                ))}
            </MenuList>
        </Menu>
    )
}
