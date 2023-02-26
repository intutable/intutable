import { format } from "components/UndoHistory/format"
import { useSnacki } from "hooks/useSnacki"
import { useUndoManager } from "hooks/useUndoManager"
import { useUserSettings } from "hooks/useUserSettings"
import { useRouter } from "next/router"
import React, { useEffect, useReducer } from "react"
import {
    UndoManagerEmptyCache,
    UndoManagerNoMoreRedo,
    UndoManagerNoMoreUndo,
} from "utils/UndoManager"

// eslint-disable-next-line @typescript-eslint/ban-types
export type UndoContextProps = {}

const initialState: UndoContextProps = {
    updateCallback: undefined!,
}

const UndoContext = React.createContext<UndoContextProps>(initialState)

export const useUndoContext = () => React.useContext(UndoContext)

export type UndoContextProviderProps = {
    children: React.ReactNode
}

/** Only listens to shortcut events and then fires undo/redo */
export const UndoContextProvider: React.FC<UndoContextProviderProps> = props => {
    const { snackError, snackWarning, snackSuccess } = useSnacki()
    const { undoManager } = useUndoManager()
    const { userSettings } = useUserSettings()
    const router = useRouter()

    useEffect(() => {
        if (window == null || undoManager == null) return

        const getOs = () => {
            const os = ["Windows", "Linux", "Mac"] // add your OS values
            return os.find(v => navigator.appVersion.indexOf(v) >= 0)
        }

        // BUG: useUndoManager must implement something like useSyncExternalStore
        // otherwise the state is not updated in `/history`
        const _refreshUndoHistoryPage = () => {
            if (router.pathname === "/history") {
                router.reload()
            }
        }

        const os: "macOS" | "windows" | "other" =
            getOs() === "Mac" ? "macOS" : getOs() === "Windows" ? "windows" : "other"

        if (os === "other") {
            snackWarning(
                "Auf diesem Betriebssystem wird kein 'undo/redo'-Shortcut unterstützt! Nutzen Sie den Änderungsverlauf"
            )
            return
        }

        const shortcutListener = async (e: KeyboardEvent) => {
            const isUndoMac = os === "macOS" && e.metaKey && e.key === "z" && e.shiftKey === false
            const isUndoWindows = os === "windows" && e.ctrlKey && e.key === "z"
            // undo cmd+z
            if (isUndoMac || isUndoWindows) {
                try {
                    const memento = await undoManager.undoLast()
                    const msg = (
                        <>
                            UNDO:{" "}
                            {format(memento.snapshot.newValue, memento.snapshot.column.cellType)}{" "}
                            &#8594;
                            {format(memento.snapshot.oldValue, memento.snapshot.column.cellType)}
                        </>
                    )
                    snackSuccess(msg)
                    _refreshUndoHistoryPage()
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
                    const msg = (
                        <>
                            REDO:{" "}
                            {format(memento.snapshot.oldValue, memento.snapshot.column.cellType)}{" "}
                            &#8594;
                            {format(memento.snapshot.newValue, memento.snapshot.column.cellType)}
                        </>
                    )
                    snackSuccess(msg)
                    _refreshUndoHistoryPage()
                } catch (error) {
                    if (error instanceof UndoManagerEmptyCache)
                        snackWarning("UNDO: Keine Aktionen im Cache.")
                    if (error instanceof UndoManagerNoMoreRedo)
                        snackWarning("REDO: Keine weiteren Aktionen zu wiederholen.")
                    else snackError("REDO: Aktion konnte nicht wiederholt werden!")
                }
            }
        }

        if (userSettings?.enableUndoCache) {
            document.addEventListener("keydown", shortcutListener)
        }

        return () => {
            document.removeEventListener("keydown", shortcutListener)
        }
    }, [router, snackError, snackSuccess, snackWarning, undoManager, userSettings?.enableUndoCache])

    return <UndoContext.Provider value={{}}>{props.children}</UndoContext.Provider>
}
