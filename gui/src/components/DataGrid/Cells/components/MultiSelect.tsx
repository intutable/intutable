import AddIcon from "@mui/icons-material/Add"
import CheckIcon from "@mui/icons-material/Check"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { Box, Chip, Divider, IconButton, Menu, MenuItem, MenuList, Stack, TextField } from "@mui/material"
import { useTheme } from "@mui/system"
import { useView } from "hooks/useView"
import { useMemo, useRef, useState } from "react"
import { FormatterProps } from "react-data-grid"
import { Column, Row } from "types"
import { stringToColor } from "utils/stringToColor"
import BookmarksIcon from "@mui/icons-material/Bookmarks"
import { Cell } from "../abstract/Cell"
import { ExposedInputProps } from "../abstract/protocols"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"

const ChipItem: React.FC<{
    label: string
    onDelete?: () => void
}> = ({ label, onDelete }) => {
    const color = stringToColor(label)
    const theme = useTheme()
    const [hovering, setHovering] = useState<boolean>(false)

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
                cursor: "pointer",
                mr: 0.5,
            }}
        />
    )
}
type MultiSelectMenuProps = {
    open: boolean
    anchor: HTMLElement
    options: string[]
    addOption: (option: string) => void
    onClose: () => void
}
const MultiSelectMenu: React.FC<MultiSelectMenuProps> = props => {
    const [input, setInput] = useState<string>("")

    return (
        <Menu
            // elevation={0}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
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
            <MenuItem>
                <TextField
                    label="Option hinzufügen"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter") props.addOption(input)
                    }}
                />
                <IconButton size="small" sx={{ ml: 1 }} onClick={() => props.addOption(input)}>
                    <CheckIcon fontSize="small" color="primary" />
                </IconButton>
            </MenuItem>
            <Divider />
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

export class MultiSelect extends Cell {
    static brand = "multiselect"
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

    private getOptions(column: Column.Deserialized, rows: Row[], self?: string[] | null): string[] {
        const options = rows
            .map(row => row[column.key])
            .flat()
            .filter(option => Cell.isEmpty(option) === false) // remove empty values

        const optionsWithoutSelf = (
            self == null ? options : options.filter(option => self.includes(option as string) === false)
        ) as string[]

        const uniqueOptions = new Set(optionsWithoutSelf)

        return [...uniqueOptions]
    }

    public formatter = (props: FormatterProps<Row>) => {
        const { content, column, row, key } = this.destruct<string[] | null>(props)
        const isEmpty = content == null || content.length === 0

        const [hovering, setHovering] = useState<boolean>(false)
        const modalRef = useRef<HTMLElement | null>(null)
        const [open, setOpen] = useState<boolean>(false)
        const openModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen(true)
        }
        const closeModal = () => setOpen(false)

        const addChip = (value: string) => {
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
        const list = useMemo(() => (data ? this.getOptions(column, data.rows, content) : []), [data, column, content])

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
                    ref={modalRef}
                >
                    {isEmpty ? (
                        <>
                            {hovering && (
                                <IconButton size="small" onClick={openModal}>
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
                                    content.map(chip => (
                                        <ChipItem label={chip} key={chip} onDelete={() => removeChip(chip)} />
                                    ))}
                            </Box>
                            {hovering && (
                                <IconButton size="small" onClick={openModal}>
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

        const modalRef = useRef<HTMLElement | null>(null)

        const [open, setOpen] = useState<boolean>(false)
        const openModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen(true)
        }
        const closeModal = () => setOpen(false)

        const addChip = async (value: string) => {
            try {
                const update = props.content ? [...props.content, value] : [value]
                await updateRow(props.column, props.row, update)
            } catch (e) {
                snackError("Der Wert konnte nicht geändert werden")
            } finally {
                closeModal()
            }
        }
        const removeChip = async (value: string) => {
            if (props.content == null) return
            try {
                const update = props.content.filter(option => option !== value)
                await updateRow(props.column, props.row, update)
            } catch (e) {
                snackError("Der Wert konnte nicht geändert werden")
            } finally {
                closeModal()
            }
        }

        const { data } = useView()
        const list = useMemo(
            () => (data ? this.getOptions(props.column, data.rows, props.content) : []),
            [data, props.column, props.content]
        )

        return (
            <>
                <Stack
                    ref={modalRef}
                    direction="row"
                    sx={{
                        gap: "5px",
                        maxWidth: "200px",
                        flexWrap: "wrap",
                        w: 1,
                        h: 1,
                    }}
                >
                    {props.content &&
                        props.content.map(option => (
                            <ChipItem label={option} key={option} onDelete={() => removeChip(option)} />
                        ))}

                    {props.hoveringOnParent && (
                        <IconButton size="small" onClick={openModal}>
                            <AddIcon fontSize="small" />
                        </IconButton>
                    )}
                </Stack>

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
}
