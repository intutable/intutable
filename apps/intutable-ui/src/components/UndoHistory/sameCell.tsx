import { Memento } from "utils/UndoManager"
import { CellID } from "./UndoHistory"

export const sameCell = (memento: Memento, cell: CellID | null) =>
    memento.snapshot.row._id === cell?.rowId &&
    memento.snapshot.column.id === cell?.columnId &&
    memento.snapshot.view.id === cell?.viewId

export const sameCellDistinctMemento = (memento: Memento, cell: CellID | null) =>
    sameCell(memento, cell) && memento.uid !== cell?.mementoID
