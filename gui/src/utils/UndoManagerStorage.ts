import { Memento, MementoID, Snapshot } from "./UndoManager"

export class UndoManagerStorage implements IterableIterator<Memento> {
    static StorageKeyMementoPrefix = "UndoManager_Memento--" as const
    static StatePointerStorageKey = "UndoManager_StatePointer" as const

    static sort(mementos: Memento[]): Memento[] {
        return mementos.sort((a, b) => a.timestamp - b.timestamp)
    }

    // deeper level of abstraction of `pointer`
    // holds the uid in the session storage, because it cannot be lost during reloads etc.
    private set _pointingMemento(memento: MementoID | null) {
        if (!memento) window.sessionStorage.removeItem(UndoManagerStorage.StatePointerStorageKey)
        else window.sessionStorage.setItem(UndoManagerStorage.StatePointerStorageKey, memento.uid)
    }
    private get _pointingMemento(): MementoID | null {
        const uid = window.sessionStorage.getItem(UndoManagerStorage.StatePointerStorageKey)
        return this.mementos.find(item => item.uid === uid) ?? null
    }

    // actuallay a pointer that holds the index of the current memento in the sorted array
    protected set pointer(index: number) {
        const memento = this.mementos[index]
        if (memento) this._pointingMemento = memento
        else this._pointingMemento = null
    }
    /** returns `-1` if nothing found */
    protected get pointer(): number {
        const pointingMemento = this._pointingMemento
        const indexOf = this.mementos.findIndex(item => item.uid === pointingMemento?.uid)
        return indexOf
    }

    get size(): number {
        return this.mementos.length
    }

    prev(): IteratorResult<Memento> {
        if (this.pointer > 0) {
            return {
                done: false,
                value: this.mementos[this.pointer--],
            }
        } else {
            return {
                done: true,
                value: null,
            }
        }
    }

    next(): IteratorResult<Memento> {
        if (this.pointer < this.mementos.length) {
            return {
                done: false,
                value: this.mementos[this.pointer++],
            }
        } else {
            return {
                done: true,
                value: null,
            }
        }
    }

    [Symbol.iterator](): IterableIterator<Memento> {
        return this
    }

    constructor(public maxCacheSize: number) {
        if (maxCacheSize < 2)
            throw new Error(
                "UndoManager: If enabled, the cache needs to be at least 2 mementos in size!"
            )
    }

    get mementos(): Memento[] {
        const mementoKeys = Object.keys(window.sessionStorage).filter(item =>
            item.startsWith(UndoManagerStorage.StorageKeyMementoPrefix)
        )
        const mementos = mementoKeys
            .map(key => window.sessionStorage.getItem(key))
            .map(item => JSON.parse(item!) as Memento)
        return mementos
    }

    add(snapshot: Snapshot) {
        const uid: Memento["uid"] = crypto.randomUUID()
        const key = UndoManagerStorage.StorageKeyMementoPrefix + uid
        const memento: Memento = {
            uid,
            timestamp: Date.now(),
            action: "cell-value-changed",
            snapshot,
        }
        // add memento
        window.sessionStorage.setItem(key, JSON.stringify(memento))
        // update pointer
        this._pointingMemento = memento
        // clean up
        this.collectGarbage()
    }

    remove(...mementos: Memento[]) {
        mementos.forEach(memento => {
            const key = UndoManagerStorage.StorageKeyMementoPrefix + memento.uid
            window.sessionStorage.removeItem(key)
        })
    }

    private collectGarbage(): { dropped: number } {
        if (this.size > this.maxCacheSize) {
            const overflowSize = this.size - this.maxCacheSize
            this.remove(...this.mementos.slice(0, overflowSize))
            return { dropped: overflowSize }
        }
        return { dropped: 0 }
    }

    cleanUp() {
        // delete all mementos
        Object.keys(window.sessionStorage)
            .filter(item => item.startsWith(UndoManagerStorage.StorageKeyMementoPrefix))
            .forEach(key => window.sessionStorage.removeItem(key))
        // delete pointer
        window.sessionStorage.removeItem(UndoManagerStorage.StatePointerStorageKey)
    }
}
