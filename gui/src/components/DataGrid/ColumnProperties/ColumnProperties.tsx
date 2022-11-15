import { useColumn } from "hooks/useColumn"
import { useSnacki } from "hooks/useSnacki"
import React from "react"
import { Column } from "types"
import { makeError } from "utils/error-handling/utils/makeError"
import { prepareName } from "utils/validateName"
import { ColumnPropertyInput } from "./ColumnPropertyInput"

// text based

export const Name: React.FC<{ column: Column.Serialized }> = props => {
    const { snackError } = useSnacki()
    const { renameColumn } = useColumn()

    const changeName = async (name: string) => {
        try {
            await renameColumn(props.column, prepareName(name))
        } catch (error) {
            const err = makeError(error)
            snackError(
                err.message === "alreadyTaken"
                    ? "Dieser Name ist bereits vergeben."
                    : "Die Spalte konnte nicht umbenannt werden!"
            )
        }
    }

    return (
        <ColumnPropertyInput
            label="Name"
            type="text"
            value={props.column.name}
            onChange={changeName}
        />
    )
}

// boolean based

const _makeBooleanInput = (
    label: string,
    columnKey: keyof Column.Serialized
) => {
    const BooleanInput: React.FC<{ column: Column.Serialized }> = props => {
        const { snackError } = useSnacki()
        const { changeAttributes } = useColumn()

        const changeProp = async (newValue: boolean) => {
            try {
                await changeAttributes(props.column, {
                    [columnKey]: newValue,
                })
            } catch (error) {
                snackError("Fehler beim Ändern der Eigenschaft!")
            }
        }

        return (
            <ColumnPropertyInput
                label={label}
                type="switch"
                value={props.column[columnKey] as boolean}
                onChange={changeProp}
            />
        )
    }
    return BooleanInput
}

export const Hidden = _makeBooleanInput("Ausgeblendet", "hidden")

export const Editable = _makeBooleanInput("Editierbar", "editable")
export const Frozen = _makeBooleanInput("Eingefroren", "frozen")
export const Resizable = _makeBooleanInput("Vergrößerbar", "resizable")
export const Sortable = _makeBooleanInput("Sortierbar", "sortable")
