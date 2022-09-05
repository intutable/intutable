import { EditorProps, FormatterProps } from "react-data-grid"
import { Row } from "types"
import Cell from "../Cell"
import {
    Chip,
    Box,
    IconButton,
    Menu,
    MenuList,
    MenuItem,
    TextField,
    Divider,
} from "@mui/material"
import { useView } from "hooks/useView"
import { useMemo, useState } from "react"
import { stringToColor } from "utils/stringToColor"
import { useTheme } from "@mui/system"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import CheckIcon from "@mui/icons-material/Check"
import AddIcon from "@mui/icons-material/Add"

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
            }}
        />
    )
}

export class Select extends Cell {
    readonly brand = "select"
    label = "Auswahlliste"

    editor = () => null

    formatter = (props: FormatterProps<Row>) => {
        const {
            content,
            column: _column,
            row,
            key,
        } = this.destruct<string | null | undefined>(props)
        const isEmpty = content == null || content === ""

        const [hovering, setHovering] = useState<boolean>(false)
        const [open, setOpen] = useState<Element | null>(null)
        const openModal = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen(e.currentTarget)
        }
        const closeModal = () => setOpen(null)

        const [input, setInput] = useState<string>("")
        const changeOption = (value: string) => {
            props.onRowChange({
                ...row,
                [key]: value,
            })
            closeModal()
        }

        const { data } = useView()
        const list: string[] | null = useMemo(() => {
            if (data == null) return null

            const values = data.rows
                .map(row => row[_column.key] as string)
                .filter(value => typeof value === "string" && value.length > 0)

            return [...new Set(values)]
        }, [_column.key, data])

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
                                <ChipItem
                                    label={content}
                                    onDelete={
                                        hovering
                                            ? () => changeOption("")
                                            : undefined
                                    }
                                />
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
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                    open={open != null}
                    anchorEl={open}
                    keepMounted
                    onClose={closeModal}
                    PaperProps={{
                        sx: {
                            // boxShadow: theme.shadows[1],
                        },
                    }}
                >
                    <MenuItem>
                        <TextField
                            label="Option hinzufügen"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter") changeOption(input)
                            }}
                        />
                        <IconButton
                            size="small"
                            sx={{ ml: 1 }}
                            onClick={() => changeOption(input)}
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
                        {list
                            ?.filter(item => item !== content)
                            .map(item => (
                                <MenuItem
                                    key={item}
                                    data-value={item}
                                    onClick={e =>
                                        changeOption(
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

    isValid(value: unknown) {
        return typeof value === "string"
    }
}
