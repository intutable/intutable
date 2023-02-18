import { History, Memento } from "utils/UndoManager"

export const isCurrentMemento = (memento: Memento, history: History): boolean =>
    history.state != null && history.state >= 0 && history.cache[history.state].uid === memento.uid
