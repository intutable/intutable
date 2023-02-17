import { Memento, Snapshot } from "./UndoManager"

export class UndoManagerStorageMismatch extends Error {}

export class UndoManagerStorage {
    static StorageKeyMementoPrefix = "UndoManager_Memento--" as const
    static StatePointerStorageKey = "UndoManager_StatePointer" as const
    static StatePointerEverythindUndone = "UndoManager_EverythingUndone" as const

    static sort(mementos: Memento[]): Memento[] {
        return mementos.sort((a, b) => a.timestamp - b.timestamp)
    }
    protected indexOf(memento: Memento): number {
        return this.mementos.findIndex(item => item.uid === memento.uid)
    }

    constructor(public maxCacheSize: number) {}

    /** Returns all mementos from cache */
    get mementos(): Memento[] {
        const mementoKeys = Object.keys(sessionStorage).filter(item =>
            item.startsWith(UndoManagerStorage.StorageKeyMementoPrefix)
        )
        const mementos = mementoKeys
            .map(key => sessionStorage.getItem(key))
            .map(item => JSON.parse(item!) as Memento)
        return UndoManagerStorage.sort(mementos)
    }

    /** Size of the cache/mementos */
    get size(): number {
        return this.mementos.length
    }

    /** Set the current memento in `mementos`. ('null' to reset | '-1' for everything undone) */
    protected set state(index: number | null) {
        if (index === null) {
            sessionStorage.removeItem(UndoManagerStorage.StatePointerStorageKey)
            return
        }
        if (this.size === 0 && index >= 0)
            throw new Error("UndoManager: cannot set state of empty cache!")
        // when doing undo, the index can be -1 if no more undo is possible
        if (index === -1) {
            sessionStorage.setItem(
                UndoManagerStorage.StatePointerStorageKey,
                UndoManagerStorage.StatePointerEverythindUndone // set to a special value
            )
            return
        }
        const memento = this.mementos[index]
        if (memento == null) throw new Error("UndoManager: cannot set state out of bounds!")
        sessionStorage.setItem(UndoManagerStorage.StatePointerStorageKey, memento.uid)
    }

    /** Returns the index of the current memento in `mementos`. ('null' if the cache is empty | `-1` if everything is undone) */
    get state(): number | null {
        if (this.size === 0) return null
        const stateValue = sessionStorage.getItem(UndoManagerStorage.StatePointerStorageKey)

        if (stateValue === UndoManagerStorage.StatePointerEverythindUndone) return -1

        const indexOf = this.mementos.findIndex(item => item.uid === stateValue)
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
        sessionStorage.setItem(key, JSON.stringify(memento))
        // update pointer
        this.state = this.indexOf(memento)
        // clean up
        // this.collectGarbage()
    }

    /** Removes one or more mementos from the cache */
    remove(...mementos: Memento[]) {
        mementos.forEach(memento => {
            const key = UndoManagerStorage.StorageKeyMementoPrefix + memento.uid
            sessionStorage.removeItem(key)
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
        Object.keys(sessionStorage)
            .filter(item => item.startsWith(UndoManagerStorage.StorageKeyMementoPrefix))
            .forEach(key => sessionStorage.removeItem(key))
        // delete pointer
        sessionStorage.removeItem(UndoManagerStorage.StatePointerStorageKey)
    }

    /** Returns the next element previous to the current state  */
    prev(): IteratorResult<Memento> {
        // Note: this is no iterator
        if (this.state && this.state > 0 && this.size > 0) {
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
        if (this.state && this.state > 0 && this.size > 0) {
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
        if (this.state !== null && this.size > 0) {
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
