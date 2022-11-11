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
import { Row } from "types"
import { stringToColor } from "utils/stringToColor"
import BookmarksIcon from "@mui/icons-material/Bookmarks"
import { Cell } from "../abstract/Cell"

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

    formatter = (props: FormatterProps<Row>) => {
        const {
            content,
            column: _column,
            row,
            key,
        } = this.destruct<string[]>(props)
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
                [key]: [...content, value],
            })
            closeModal()
        }
        const removeChip = (value: string) => {
            props.onRowChange({
                ...row,
                [key]: content.filter(v => v !== value),
            })
            closeModal()
        }

        const { data } = useView()
        const list: string[] = useMemo(() => {
            return []
            // BUG: get this working again

            // const values = data.rows
            //     // .map(row => this.parse(row[_column.key])) // deserialize instead
            //     .flat()
            //     .filter(value => typeof value === "string" && value.length > 0)
            // .filter(value => content.includes(value) === false)

            // return [...new Set(values)]
        }, [])

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
}
