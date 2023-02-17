import { History, Memento } from "utils/UndoManager"

export const isCurrentMemento = (memento: Memento, history: History): boolean =>
    history.cache[history.state!].uid === memento.uid
