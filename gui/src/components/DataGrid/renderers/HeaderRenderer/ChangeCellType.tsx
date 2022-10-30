import React from "react"
import { Button, MenuItem, Select, SelectChangeEvent } from "@mui/material"
import cells from "@datagrid/Cells"
import { Column } from "types"
import { useView } from "hooks/useView"
import { ColumnUtility } from "utils/ColumnUtility"
import { useSnacki } from "hooks/useSnacki"
import { useColumn } from "hooks/useColumn"

type ChangeCellTypeProps = {
    column: Column.Deserialized
    onClose: () => void
}

export const ChangeCellType: React.FC<ChangeCellTypeProps> = props => {
    const { data: view } = useView()
    const { changeAttributes } = useColumn()
    const { snackSuccess, snackError, closeSnackbar } = useSnacki()

    const [cellType, setCellType] = React.useState(props.column.cellType)

    const handleChange = async (event: SelectChangeEvent<string>) => {
        setCellType(event.target.value)

        try {
            const currentCell = cells.getCell(props.column.cellType!)
            const wantedCell = cells.getCell(event.target.value)

            const invalidCells = ColumnUtility.canInterchangeColumnType(
                wantedCell.getBrand(),
                props.column,
                view!
            )

            if (invalidCells !== true) {
                const allInvalid = invalidCells.length === view!.rows.length
                if (allInvalid)
                    return snackError(
                        `Der Spaltentyp '${currentCell.getLabel()}' kann nicht zu '${wantedCell.getLabel()}' konvertiert werden.`
                    )
                return snackError(
                    `Die Zeilen ${invalidCells.join(
                        ","
                    )} können nicht zu '${wantedCell.getLabel()}' konvertiert werden.`,
                    {
                        persist: true,
                        action: key => (
                            <Button
                                onClick={() => closeSnackbar(key)}
                                sx={{ color: "white" }}
                            >
                                Verstanden
                            </Button>
                        ),
                    }
                )
            }

            await changeAttributes(props.column, {
                cellType: wantedCell.getBrand(),
            })

            snackSuccess(
                `Der Spaltentype wurde von '${currentCell.getLabel()}' zu '${wantedCell.getLabel()}' konvertiert.`
            )
        } catch (error) {
            snackError("Es ist ein Fehler aufgetreten.")
        } finally {
            props.onClose()
        }
    }

    if (props.column.cellType == null) return null

    return (
        <Select onChange={handleChange} value={cellType}>
            {Array.from(cells.getMap()).map(([brand, label]) => (
                <MenuItem key={brand} value={brand}>
                    {label}
                </MenuItem>
            ))}
        </Select>
    )
}
