import cells from "@datagrid/Cells"
import { Button } from "@mui/material"
import { useColumn } from "hooks/useColumn"
import { useSnacki } from "hooks/useSnacki"
import { useView } from "hooks/useView"
import React from "react"
import { Column } from "types"
import { ColumnUtility } from "utils/column utils/ColumnUtility"
import { ColumnPropertyInput } from "./ColumnPropertyInput"

export const ChangeCellType: React.FC<{
    column: Column.Serialized
}> = props => {
    const { data: view } = useView()
    const { changeAttributes } = useColumn()
    const { snackSuccess, snackError, closeSnackbar } = useSnacki()

    const [cellType, setCellType] = React.useState(props.column.cellType)

    const handleChange = async (value: string) => {
        setCellType(value)

        try {
            const currentCell = cells.getCell(props.column.cellType)
            const wantedCell = cells.getCell(value)

            const invalidCells = ColumnUtility.canInterchangeColumnType(wantedCell.brand, props.column, view!)

            if (invalidCells !== true) {
                const allInvalid = invalidCells.length === view!.rows.length
                if (allInvalid)
                    return snackError(
                        `Der Spaltentyp '${currentCell.label}' kann nicht zu '${wantedCell.label}' konvertiert werden.`
                    )
                return snackError(
                    `Die Zeilen ${invalidCells.join(",")} können nicht zu '${wantedCell.label}' konvertiert werden.`,
                    {
                        persist: true,
                        action: key => (
                            <Button onClick={() => closeSnackbar(key)} sx={{ color: "white" }}>
                                Verstanden
                            </Button>
                        ),
                    }
                )
            }

            await changeAttributes(props.column, {
                cellType: wantedCell.brand,
            })

            snackSuccess(`Der Spaltentype wurde von '${currentCell.label}' zu '${wantedCell.label}' konvertiert.`)
        } catch (error) {
            snackError("Es ist ein Fehler aufgetreten.")
        }
    }

    return (
        <ColumnPropertyInput
            label="Spaltentyp"
            type="select"
            value={{
                value: cellType,
                options: Array.from(cells.getMap()),
            }}
            onChange={handleChange}
        />
    )
}
