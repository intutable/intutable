import { cellMap } from "@datagrid/Cells"
import { Button } from "@mui/material"
import { useColumn } from "hooks/useColumn"
import { useSnacki } from "hooks/useSnacki"
import { useView } from "hooks/useView"
import column from "pages/api/table/[tableId]/column"
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
            const currentCell = cellMap.instantiate(props.column)
            const wantedCell = cellMap.unsafe_instantiateDummyCell(value)

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
                options:
                    props.column.isUserPrimaryKey === true
                        ? cellMap.getBrandLabelMap().map(({ brand, label }) => ({
                              brand,
                              label,
                              disabled: cellMap.unsafe_instantiateDummyCell(brand).canBeUserPrimaryKey === false,
                          }))
                        : cellMap.getBrandLabelMap(),
            }}
            onChange={handleChange}
        />
    )
}
