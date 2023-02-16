import { History, Memento } from "utils/UndoManager"

export const isCurrentMemento = (memento: Memento, history: History): boolean =>
    history.mementos[history.state.current].uid === memento.uid
