import { Memento } from "utils/UndoManager"
import { CellID } from "./UndoHistory"

export const sameCell = (memento: Memento, cell: CellID | null) =>
    memento.snapshot.rowId === cell?.rowId &&
    memento.snapshot.columnId === cell?.columnId &&
    memento.snapshot.viewId === cell?.viewId

export const sameCellDistinctMemento = (memento: Memento, cell: CellID | null) =>
    sameCell(memento, cell) && memento.uid !== cell?.mementoID
