import { ImplementationError } from "utils/ImplementationError"
import { Cache, Memento, State, History } from "utils/UndoManager"

export const getListPosition = (
    memento: Memento,
    history: History
): "before-pointer" | "after-pointer" | "equal-to-pointer" => {
    const { cache, state } = history
    if (state === null) throw new ImplementationError() // state is only null when cache is empty

    if (cache[state].uid === memento.uid) return "equal-to-pointer"

    const pointerMemento = cache[state]
    if (!pointerMemento) throw new Error("Could not find pointer memento")

    if (pointerMemento.timestamp > memento.timestamp) return "before-pointer"

    if (pointerMemento.timestamp < memento.timestamp) return "after-pointer"

    throw new Error("Could not determine list position")
}
