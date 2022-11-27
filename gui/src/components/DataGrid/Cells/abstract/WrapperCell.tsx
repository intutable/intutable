import { Cell } from "./Cell"
import { ExposableInputComponent } from "./protocols"

export class WrapperCell extends Cell {
    constructor(public innerCell: Cell) {
        super()
    }
}

/**
 * when Link
 * - own components
 *
 * when Lookup
 * - only set editable to false
 */
