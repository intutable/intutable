import AddIcon from "@mui/icons-material/Add"
import BookmarksIcon from "@mui/icons-material/Bookmarks"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { Box, IconButton, Stack } from "@mui/material"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { useView } from "hooks/useView"
import { useMemo, useRef, useState } from "react"
import { FormatterProps } from "react-data-grid"
import { Column, Row } from "types"
import { Cell } from "../abstract/Cell"
import { ExposedInputProps } from "../abstract/protocols"
import { ChipItem, SelectMenu as MultiSelectMenu } from "./Select"

export class MultiSelect extends Cell {
    public brand = "multiselect"
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

    /** Returns a list of all available options in this column (the values of other chips) */
    private getAvailableOptions(column: Column.Deserialized, rows: Row[], self?: string[] | null): string[] {
        const options = rows
            .map(row => row[column.key])
            .flat()
            .filter(option => Cell.isEmpty(option) === false) // remove empty values
        const optionsWithoutSelf = (
            self == null ? options : options.filter(option => self.includes(option as string) === false)
        ) as string[] // remove self from list
        const uniqueOptions = new Set(optionsWithoutSelf) // remove duplicates from list
        return [...uniqueOptions] // return sorted
    }

    public formatter = (props: FormatterProps<Row>) => {
        const { content, column, row, key } = this.destruct<string[] | null>(props)
        const isEmpty = content == null || content.length === 0

        const [hovering, setHovering] = useState<boolean>(false)
        const modalRef = useRef(null)
        const [open, setOpen] = useState<boolean>(false)
        const openModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen(true)
        }
        const closeModal = () => setOpen(false)

        const addChip = (value: string) => {
            if (Cell.isEmpty(value)) return
            if (content?.includes(value)) return
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
                                {isEmpty === false &&
                                    content.map(chip => (
                                        <ChipItem
                                            label={chip}
                                            key={chip}
                                            onDelete={this.column.editable ? () => removeChip(chip) : undefined}
                                        />
                                    ))}
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
                if (Cell.isEmpty(value)) return
                if (props.content?.includes(value)) return
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
            () => (data ? this.getAvailableOptions(props.column, data.rows, props.content) : []),
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
                            <ChipItem
                                label={option}
                                key={option}
                                onDelete={
                                    this.column.editable && this.isReadonlyComponent === false
                                        ? () => removeChip(option)
                                        : undefined
                                }
                            />
                        ))}

                    {props.hoveringOnParent && props.column.editable && this.isReadonlyComponent === false && (
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
