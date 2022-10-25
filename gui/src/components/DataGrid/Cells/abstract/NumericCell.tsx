import Cell from "@datagrid/Cells/abstract/Cell"
import { NumericCell as NumericSerializedCell } from "@shared/api/cells/abstract"

export abstract class NumericCell extends Cell {
    protected abstract serializedCellDelegate: NumericSerializedCell

    static isInteger(str: unknown): boolean {
        return NumericSerializedCell.isInteger(str)
    }

    static isFloat(str: unknown): boolean {
        return NumericSerializedCell.isFloat(str)
    }

    static isNumeric(str: unknown): boolean {
        return NumericSerializedCell.isNumeric(str)
    }
}
