import AddIcon from "@mui/icons-material/Add"
import CheckIcon from "@mui/icons-material/Check"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { Box, Chip, Divider, IconButton, Menu, MenuItem, MenuList, Stack, TextField } from "@mui/material"
import { useTheme } from "@mui/system"
import { useView } from "hooks/useView"
import { useEffect, useMemo, useRef, useState } from "react"
import { FormatterProps } from "react-data-grid"
import { Column, Row } from "types"
import { stringToColor } from "utils/stringToColor"
import BookmarkIcon from "@mui/icons-material/Bookmark"
import { Cell } from "../abstract/Cell"
import { ExposedInputProps } from "../abstract/protocols"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"

export const ChipItem: React.FC<{
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
    private getAvailableOptions(column: Column.Deserialized, rows: Row[], self?: string | null): string[] {
        const options = rows.map(row => row[column.key]).filter(option => Cell.isEmpty(option) === false) // remove empty values
        const optionsWithoutSelf = (self == null ? options : options.filter(option => self !== option)) as string[] // remove self from list
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

        const showSelectMenuButton = (hovering || open) && this.column.editable && this.isReadonlyComponent === false

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

        const modalRef = useRef<HTMLElement | null>(null)

        const [open, setOpen] = useState<boolean>(false)
        const openModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen(true)
        }
        const closeModal = () => setOpen(false)

        const changeOption = async (value: string) => {
            try {
                await updateRow(props.column, props.row, value)
            } catch (e) {
                snackError("Der Wert konnte nicht geändert werden")
            } finally {
                closeModal()
            }
        }

        const { data } = useView()
        const list = useMemo(
            () => (data ? this.getAvailableOptions(props.column, data.rows, props.content) : []),
            [data, props.column, props.content]
        )

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const disallowNewSelectValues = (props.column as any).disallowNewSelectValues ?? false

        /**
         * to implement
         * • required
         * • error
         * • label
         * • disabled
         * • readOnly
         * • placeholder
         * • tooltip
         */

        // TODO: Select und MultiSelect zu Dropdown mit Chips umbauen

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
                    {props.content && (
                        <ChipItem
                            label={props.content}
                            onDelete={this.column.editable ? () => changeOption("") : undefined}
                        />
                    )}

                    {props.hoveringOnParent && props.column.editable && this.isReadonlyComponent === false && (
                        <IconButton size="small" onClick={openModal}>
                            <AddIcon fontSize="small" />
                        </IconButton>
                    )}
                </Stack>

                {modalRef.current !== null && (
                    <SelectMenu
                        disallowAddingValues={disallowNewSelectValues}
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
}
