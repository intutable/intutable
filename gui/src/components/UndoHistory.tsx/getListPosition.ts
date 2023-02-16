import { Memento, History } from "utils/UndoManager"

export const getListPosition = (
    memento: Memento,
    history: History
): "before-pointer" | "after-pointer" | "equal-to-pointer" => {
    const pointer = history.pointer

    if (pointer === memento.uid) return "equal-to-pointer"

    const pointerMemento = history.mementos.find(m => m.uid === pointer)
    if (!pointerMemento) throw new Error("Could not find pointer memento")

    if (pointerMemento.timestamp > memento.timestamp) return "before-pointer"

    if (pointerMemento.timestamp < memento.timestamp) return "after-pointer"

    throw new Error("Could not determine list position")
}
