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
    TextField,
} from "@mui/material"
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
    return (
        <Chip
            label={label}
            size="small"
            onDelete={onDelete}
            sx={{
                color: theme.palette.getContrastText(color),
                bgcolor: color,
                cursor: "pointer",
                mr: 0.5,
            }}
        />
    )
}

export class MultiSelect extends Cell {
    readonly brand = "multiselect"
    label = "Mehrfach-Auswahlliste"
    icon = BookmarksIcon

    constructor() {
        super()
        this.setEditorOptions({
            renderFormatter: true,
            // onCellKeyDown: e => {
            //     console.log(e)
            // },
        })
    }

    isValid(value: unknown): boolean {
        return Array.isArray(value) && value.every(v => typeof v === "string")
    }

    serialize(value: string[]): string {
        return JSON.stringify(value)
    }
    deserialize(value: unknown): string[] {
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

    export(value: string[]): string {
        return value.join(";")
    }
    unexport(value: string): string[] {
        return value.split(";")
    }

    editor = () => null

    getOptions(
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
                : options.filter(
                      option => self.includes(option as string) === false
                  )
        ) as string[]

        const uniqueOptions = new Set(optionsWithoutSelf)

        return [...uniqueOptions]
    }

    formatter = (props: FormatterProps<Row>) => {
        const { content, column, row, key } = this.destruct<string[] | null>(
            props
        )
        const isEmpty = content == null || content.length === 0

        const [hovering, setHovering] = useState<boolean>(false)
        const modalRef = useRef(null)
        const [open, setOpen] = useState<boolean>(false)
        const openModal = (
            e: React.MouseEvent<HTMLButtonElement, MouseEvent>
        ) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen(true)
        }
        const closeModal = () => setOpen(false)

        const [input, setInput] = useState<string>("")
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
        const list = useMemo(
            () => (data ? this.getOptions(column, data.rows, content) : null),
            [data, column, content]
        )

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
                                {content.map(chip => (
                                    <ChipItem
                                        label={chip}
                                        key={chip}
                                        onDelete={
                                            hovering
                                                ? () => removeChip(chip)
                                                : undefined
                                        }
                                    />
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
                <Menu
                    elevation={0}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                    open={open}
                    anchorEl={modalRef.current}
                    onClose={closeModal}
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
                                if (e.key === "Enter") addChip(input)
                            }}
                        />
                        <IconButton
                            size="small"
                            sx={{ ml: 1 }}
                            onClick={() => addChip(input)}
                        >
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
                        {list?.map((item, index) => (
                            <MenuItem
                                key={index}
                                data-value={item}
                                onClick={e =>
                                    addChip(
                                        e.currentTarget.dataset[
                                            "value"
                                        ] as string
                                    )
                                }
                            >
                                <ChipItem label={item} />
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
            </>
        )
    }

    public ExposedInput: React.FC<ExposedInputProps<string | null>> = props => {
        const { getRowId, updateRow } = useRow()
        const { snackError } = useSnacki()

        const [value, setValue] = useState(props.content ?? "")

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
            setValue(e.target.value)

        const handleBlur = async () => {
            try {
                await updateRow(props.column, getRowId(props.row), value)
            } catch (e) {
                snackError("Der Wert konnte nicht geändert werden")
            }
        }

        return (
            <TextField
                size="small"
                onChange={handleChange}
                onBlur={handleBlur}
                value={value}
            />
        )
    }
}
