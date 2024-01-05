import React, { useState } from "react"
import { Column } from "types/tables/rdg"

export type LockedColumnsContextProps = {
    lock: (column: { id: number }) => void
    free: (column: { id: number }) => void
    mergeWithLocked: (columns: Column[]) => Column[]
}

const initialState: LockedColumnsContextProps = {
    lock: () => {},
    free: () => {},
    mergeWithLocked: () => [],
}

const LockedColumnsContext = React.createContext<LockedColumnsContextProps>(initialState)

export const useLockedColumns = () => React.useContext(LockedColumnsContext)

type LockedColumnsProviderProps = {
    children: React.ReactNode
}

/**
 * This is part of a massive // HACK we needed to provide for a fast workaround.
 * See this issue for details: https://gitlab.com/intutable/dekanat-app/-/issues/82
 *
 * If you lock a column, it will simply remember that specific column.
 * Then `mergeWithLocked` will override the property `resizable` in any case to `true`.
 */
export const LockedColumnsProvider: React.FC<LockedColumnsProviderProps> = props => {
    const [locked, setLocked] = useState<Array<number>>([])

    const lock = (column: { id: number }) => {
        if (!locked.some(lockedColumnId => lockedColumnId === column.id))
            setLocked([...locked, column.id])
    }

    const free = (column: { id: number }) => {
        const index = locked.findIndex(lockedColumnId => lockedColumnId === column.id)
        if (index > -1) setLocked(locked.slice(index, 1))
    }

    const mergeWithLocked = (columns: Column[]): Column[] =>
        columns.map(column => {
            const isLocked = locked.some(lockedColumnId => lockedColumnId === column.id)

            if (isLocked)
                return {
                    ...column,
                    resizable: false,
                }

            return column
        })

    return (
        <LockedColumnsContext.Provider
            value={{
                lock,
                free,
                mergeWithLocked,
            }}
        >
            {props.children}
        </LockedColumnsContext.Provider>
    )
}
