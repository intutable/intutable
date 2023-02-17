import { Memento, Snapshot } from "./UndoManager"

export class UndoManagerStorageMismatch extends Error {}

export class UndoManagerStorage {
    static StorageKeyMementoPrefix = "UndoManager_Memento--" as const
    static StatePointerStorageKey = "UndoManager_StatePointer" as const
    static sort(mementos: Memento[]): Memento[] {
        return mementos.sort((a, b) => a.timestamp - b.timestamp)
    }
    protected indexOf(memento: Memento): number {
        return this.mementos.findIndex(item => item.uid === memento.uid)
    }

    constructor(public maxCacheSize: number) {}

    /** Returns all mementos from cache */
    get mementos(): Memento[] {
        const mementoKeys = Object.keys(window.sessionStorage).filter(item =>
            item.startsWith(UndoManagerStorage.StorageKeyMementoPrefix)
        )
        const mementos = mementoKeys
            .map(key => window.sessionStorage.getItem(key))
            .map(item => JSON.parse(item!) as Memento)
        return UndoManagerStorage.sort(mementos)
    }

    /** Size of the cache/mementos */
    get size(): number {
        return this.mementos.length
    }

    /** Set the current memento in `mementos`. ('null' to reset) */
    protected set state(index: number | null) {
        if (index === null) {
            window.sessionStorage.removeItem(UndoManagerStorage.StatePointerStorageKey)
            return
        }
        if (this.size === 0) throw new Error("UndoManager: cannot set state of empty cache!")
        const memento = this.mementos[index]
        if (memento == null) throw new Error("UndoManager: cannot set state out of bounds!")
        window.sessionStorage.setItem(UndoManagerStorage.StatePointerStorageKey, memento.uid)
    }

    /** Returns the index of the current memento in `mementos`. ('null' if the cache is empty) */
    get state(): number | null {
        if (this.size === 0) return null
        const uid = window.sessionStorage.getItem(UndoManagerStorage.StatePointerStorageKey)
        const indexOf = this.mementos.findIndex(item => item.uid === uid)
        // mismatch
        if (indexOf === -1) {
            throw this.destroySelf()
        }
        return indexOf
    }

    /** Adds a memento to the cache */
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
        this.state = this.indexOf(memento)
        // clean up
        // this.collectGarbage()
    }

    /** Removes one or more mementos from the cache */
    remove(...mementos: Memento[]) {
        mementos.forEach(memento => {
            const key = UndoManagerStorage.StorageKeyMementoPrefix + memento.uid
            window.sessionStorage.removeItem(key)
        })
    }

    // private collectGarbage(): { dropped: number } {
    //     if (this.size > this.maxCacheSize) {
    //         const overflowSize = this.size - this.maxCacheSize
    //         this.remove(...this.mementos.slice(0, overflowSize))
    //         return { dropped: overflowSize }
    //     }
    //     return { dropped: 0 }
    // }

    private destroySelf() {
        this.clearCache()
        throw new UndoManagerStorageMismatch()
    }

    /** Clears the cache with all mementos */
    clearCache() {
        // delete all mementos
        Object.keys(window.sessionStorage)
            .filter(item => item.startsWith(UndoManagerStorage.StorageKeyMementoPrefix))
            .forEach(key => window.sessionStorage.removeItem(key))
        // delete pointer
        window.sessionStorage.removeItem(UndoManagerStorage.StatePointerStorageKey)
    }

    /** Returns the next element previous to the current state  */
    prev(): IteratorResult<Memento> {
        // Note: this is no iterator
        if (this.state && this.state > 0) {
            return {
                done: false,
                value: this.mementos[this.state - 1],
            }
        } else {
            return {
                done: true,
                value: null,
            }
        }
    }
    /** Returns the current state as a memento */
    current(): IteratorResult<Memento> {
        // Note: this is no iterator
        if (this.state != null) {
            return {
                done: false,
                value: this.mementos[this.state],
            }
        } else {
            return {
                done: true,
                value: null,
            }
        }
    }
    /** Returns the next element after the current state  */
    next(): IteratorResult<Memento> {
        // Note: this is no iterator
        if (this.state && this.state < this.mementos.length) {
            return {
                done: false,
                value: this.mementos[this.state + 1],
            }
        } else {
            return {
                done: true,
                value: null,
            }
        }
    }
}
