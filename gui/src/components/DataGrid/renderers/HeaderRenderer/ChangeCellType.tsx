import React from "react"
import { MenuItem, Select, SelectChangeEvent } from "@mui/material"
import cells from "@datagrid/Cells"
import { Column } from "types"
import { useView } from "hooks/useView"
import { ColumnUtility } from "utils/ColumnUtility"
import { useSnacki } from "hooks/useSnacki"
import { useColumn } from "hooks/useColumn"

type ChangeCellTypeProps = {
    column: Column
}

export const ChangeCellType: React.FC<ChangeCellTypeProps> = props => {
    const { data: view } = useView()
    // const {} = useColumn()
    const { snackSuccess, snackError } = useSnacki()

    const [cellType, setCellType] = React.useState(
        props.column._cellContentType
    )

    const handleChange = async (event: SelectChangeEvent<string>) => {
        setCellType(event.target.value)
        const currentCell = cells.getCell(props.column._cellContentType!)
        const wantedCell = cells.getCell(event.target.value)

        const invalidCells = ColumnUtility.canInterchangeColumnType(
            wantedCell.brand,
            props.column,
            view!
        )

        if (invalidCells !== true) {
            const allInvalid = invalidCells.length === view!.rows.length
            if (allInvalid)
                return snackError(
                    `Der Spaltentyp '${currentCell.label}' kann nicht zu '${wantedCell.label}' konvertiert werden.`
                )
            return snackError(
                `Die Zeilen ${invalidCells.join(",")} können nicht zu '${
                    wantedCell.label
                }' konvertiert werden.`,
                {
                    persist: true,
                }
            )
        }

        // TODO: update column

        snackSuccess(
            `Der Spaltentype wurde von '${currentCell.label}' zu '${wantedCell.label}' konvertiert.`
        )
    }

    if (props.column._cellContentType == null) return null

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
