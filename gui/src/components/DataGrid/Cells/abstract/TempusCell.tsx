import Cell from "./Cell"
import { TempusCell as TempusSerializedCell } from "@shared/api/cells/abstract"

export abstract class TempusCell extends Cell {
    protected abstract serializedCellDelegate: TempusSerializedCell

    /** Whether the value is a formatted time or date string,
     * if 'true', the parsed string is returned as Date object */
    static isFormattedString(value: unknown): Date | false {
        return TempusSerializedCell.isFormattedString(value)
    }
}
