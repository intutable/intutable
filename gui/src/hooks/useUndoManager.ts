import { fetcher } from "api"
import { useTable } from "hooks/useTable"
import { useUserSettings } from "hooks/useUserSettings"
import { useView } from "hooks/useView"
import { useEffect, useMemo, useState } from "react"
import { UndoManager } from "../utils/UndoManager"

export const useUndoManager = () => {
    const { userSettings } = useUserSettings()
    const { mutate: mutateTable } = useTable()
    const { mutate: mutateView } = useView()

    const [undoManager, setUndoManager] = useState<UndoManager | null>(null)
    const [loading, setLoading] = useState(false)

    // BUG: useEffect does not update state correctly
    // BUG: but useMemo bugs because window is not defined

    useEffect(() => {
        if (typeof window === undefined) return
        const instance = new UndoManager({
            updateRowCallback: async (snapshot, action) => {
                setLoading(true)
                await fetcher({
                    url: "/api/row",
                    body: {
                        viewId: snapshot.view.id,
                        rowsToUpdate: snapshot.row._id,
                        values: {
                            [snapshot.column.id]:
                                action === "undo" ? snapshot.oldValue : snapshot.newValue,
                        },
                    },
                    method: "PATCH",
                })
                await mutateTable()
                await mutateView()
                setLoading(false)
            },
            maxCacheSize: userSettings?.undoCacheLimit ?? 20,
        })
        setUndoManager(instance)
    }, [mutateTable, mutateView, userSettings?.undoCacheLimit])

    // const undoManager = useMemo(
    //     () =>
    //         typeof window === undefined
    //             ? null
    //             : new UndoManager({
    //                   updateRowCallback: async (snapshot, action) => {
    //                       await fetcher({
    //                           url: "/api/row",
    //                           body: {
    //                               viewId: snapshot.view.id,
    //                               rowsToUpdate: snapshot.row._id,
    //                               values: {
    //                                   [snapshot.column.id]:
    //                                       action === "undo" ? snapshot.oldValue : snapshot.newValue,
    //                               },
    //                           },
    //                           method: "PATCH",
    //                       })
    //                       await mutateTable()
    //                       await mutateView()
    //                   },
    //                   maxCacheSize: userSettings?.undoCacheLimit ?? 20,
    //               }),
    //     [mutateTable, mutateView, userSettings?.undoCacheLimit]
    // )

    return {
        undoManager,
        loading: undoManager == null || loading,
    }
}
