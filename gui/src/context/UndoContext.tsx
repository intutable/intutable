import { fetcher } from "api"
import { useSnacki } from "hooks/useSnacki"
import { useTable } from "hooks/useTable"
import { useUndoManager } from "hooks/useUndoManager"
import { useUserSettings } from "hooks/useUserSettings"
import { useView } from "hooks/useView"
import React, { useEffect, useMemo } from "react"
import {
    UndoManager,
    UndoManagerEmptyCache,
    UndoManagerNoMoreRedo,
    UndoManagerNoMoreUndo,
} from "utils/UndoManager"

export type UndoContextProps = {
    undoManager: UndoManager | null
}

const initialState: UndoContextProps = {
    undoManager: null,
}

const UndoContext = React.createContext<UndoContextProps>(initialState)

export const useUndo = () => React.useContext(UndoContext)

export type UndoContextProviderProps = {
    children: React.ReactNode
}

const getOS = (): "macOS" | "windows" | "other" => "macOS" // TODO

/** Only listens to shortcut events and then fires undo/redo */
export const UndoContextProvider: React.FC<UndoContextProviderProps> = props => {
    const { snackError, snackWarning, snackInfo, snackSuccess } = useSnacki()
    const { undoManager } = useUndoManager()

    useEffect(() => {
        console.log("history", undoManager?.history)
    }, [undoManager?.history])

    useEffect(() => {
        if (window == null || undoManager == null) return

        const os: "macOS" | "windows" | "other" = getOS()

        if (os === "other") {
            snackWarning("Auf diesem Betriebssystem wird kein 'undo' unterstützt!")
            return
        }

        const shortcutListener = async (e: KeyboardEvent) => {
            const isUndoMac = os === "macOS" && e.metaKey && e.key === "z" && e.shiftKey === false
            const isUndoWindows = os === "windows" && e.ctrlKey && e.key === "z"
            // undo cmd+z
            if (isUndoMac || isUndoWindows) {
                try {
                    const memento = await undoManager.undoPrevious()
                    snackSuccess(
                        `UNDO: '${memento.snapshot.newValue}' --> '${memento.snapshot.oldValue}'.`
                    )
                } catch (error) {
                    if (error instanceof UndoManagerEmptyCache)
                        snackWarning("UNDO: Keine Aktionen im Cache.")
                    else if (error instanceof UndoManagerNoMoreUndo)
                        snackWarning("UNDO: Keine weiteren Aktionen rückgängig zu machen.")
                    else snackError("UNDO: Aktion konnte nicht rückgängig gemacht werden!")
                }
            }

            const isRedoMac =
                os === "macOS" && e.metaKey && e.shiftKey && (e.key === "z" || e.key === "Z")
            const isRedoWindows = os === "windows" && e.ctrlKey && e.key === "y"
            // redo: shift+cmd+z
            if (isRedoMac || isRedoWindows) {
                try {
                    const memento = await undoManager.redoLast()
                    snackSuccess(
                        `UNDO: '${memento.snapshot.oldValue}' --> '${memento.snapshot.newValue}'.`
                    )
                } catch (error) {
                    if (error instanceof UndoManagerEmptyCache)
                        snackWarning("UNDO: Keine Aktionen im Cache.")
                    if (error instanceof UndoManagerNoMoreRedo)
                        snackWarning("REDO: Keine weiteren Aktionen zu wiederholen")
                    else snackError("REDO: Aktion konnte nicht wiederholt werden!")
                }
            }
        }
        document.addEventListener("keydown", shortcutListener)

        return () => {
            document.removeEventListener("keydown", shortcutListener)
        }
    }, [snackError, snackSuccess, snackWarning, undoManager])

    return (
        <UndoContext.Provider
            value={{
                undoManager,
            }}
        >
            {props.children}
        </UndoContext.Provider>
    )
}
