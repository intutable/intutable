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
    /** index of the current memento */
    state: { current: number }
    mementos: Memento[]
}

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

    public get history(): History | null {
        return {
            mementos: this.mementos,
            state: { current: this.pointer },
        }
    }

    public addMemento(snapshot: Snapshot) {
        // cut history if not at the end
        if (this.pointer !== this.mementos.length - 1) {
            this.remove(...this.mementos.slice(this.pointer + 1))
        }
        // then insert
        this.add(snapshot)
    }

    // async jump(memento: MementoID) { }
    // async undoCertain(memento: MementoID): Promise<Memento> { }
    // async redoCertain(memento: MementoID): Promise<Memento> { }

    async undoPrevious(): Promise<Memento> {
        if (this.size === 0) throw new UndoManagerEmptyCache()
        if (this.pointer === -1) throw new UndoManagerNoMoreUndo()

        const memento = this.mementos[this.pointer]
        this.pointer -= 1

        await this.updateRowCallback(memento.snapshot, "undo")

        return memento
    }

    async redoLast(): Promise<Memento> {
        if (this.size === 0) throw new UndoManagerEmptyCache()
        const next = this.next()
        if (next.done) throw new UndoManagerNoMoreRedo()

        await this.updateRowCallback(next.value.snapshot, "redo")
        this.pointer += 1

        return next.value
    }
}
