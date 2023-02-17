import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { Column, TableDescriptor, ViewDescriptor } from "types"
import { Row } from "types"
import { UndoManagerStorage } from "./UndoManagerStorage"

export type Snapshot = {
    project: ProjectDescriptor
    table: TableDescriptor
    view: ViewDescriptor
    column: { id: number; name: string; cellType: string }
    row: { _id: number; index: number; formattedPrimaryColumnValue: string }
    /** raw */
    oldValue: string
    /** raw */
    newValue: string
}

// TODO: if you want to make the UndoManager more generic, keep everything except the snapshot.
// The snapshot becomes dependent on the action (meaning Memento becomes generic).
// Pass a update function for each action.
// Add new capturing functions to useSnapshot for each action.
export type Action =
    | "cell-value-changed" // <- this is implemented, the others not
    | "row-added"
    | "row-deleted"
    | "column-added"
    | "column-deleted"
    | "column-prop-changed"
    | "row-prop-changed"

export type MementoID = { uid: Memento["uid"] }
export type Memento = {
    uid: string
    timestamp: number
    action: "cell-value-changed" // only Action supported for now
    snapshot: Snapshot
}

export type History = {
    cache: Cache
    state: State
}

/** alias */
export type Cache = Memento[]
/** alias */
export type State = number | null

export type UpdateRowCallback = (snapshot: Snapshot, action: "undo" | "redo") => Promise<void>

export class UndoManagerNoMoreUndo extends Error {}
export class UndoManagerNoMoreRedo extends Error {}
export class UndoManagerEmptyCache extends Error {}

export class UndoManager extends UndoManagerStorage {
    private updateRowCallback: UpdateRowCallback

    constructor(props: { updateRowCallback: UpdateRowCallback; maxCacheSize: number }) {
        super(props.maxCacheSize)
        this.updateRowCallback = props.updateRowCallback
    }

    get history() {
        return {
            cache: this.mementos,
            state: this.state,
        }
    }

    get everythingUndone() {
        return this.state === -1 && this.size > 0
    }

    addMemento(snapshot: Snapshot) {
        // cut history if not at the end
        // if (this.state !== this.mementos.length - 1) {
        //     this.remove(...this.mementos.slice(this.state + 1))
        // }
        // then insert
        this.add(snapshot)
    }

    // async jump(memento: MementoID) { }
    // async undoCertain(memento: MementoID): Promise<Memento> { }
    // async redoCertain(memento: MementoID): Promise<Memento> { }

    async undoLast(): Promise<Memento> {
        // state === null AND size > 0 means that everything has been undone
        if (this.everythingUndone) throw new UndoManagerNoMoreUndo()
        if (this.size === 0) throw new UndoManagerEmptyCache()

        const memento = this.mementos[this.state!]
        this.state! -= 1

        await this.updateRowCallback(memento.snapshot, "undo")
        return memento
    }

    async redoLast(): Promise<Memento> {
        if (this.size === 0) throw new UndoManagerEmptyCache()
        if (this.next().done) throw new UndoManagerNoMoreRedo()

        const next = this.next().value
        this.state! += 1

        await this.updateRowCallback(next.snapshot, "redo")
        return next
    }
}
