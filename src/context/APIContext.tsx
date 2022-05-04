import { ViewDescriptor } from "@intutable/lazy-views/dist/types"
import React, { useState } from "react"

export type APIContextProps = {
    table: ViewDescriptor | null
    setTable: React.Dispatch<React.SetStateAction<ViewDescriptor | null>>
}

const initialState: APIContextProps = {
    table: undefined!,
    setTable: undefined!,
}

const APIContext = React.createContext<APIContextProps>(initialState)

export const useAPI = () => React.useContext(APIContext)

export type APIContextProviderProps = {
    table?: ViewDescriptor
    children: React.ReactNode
}

export const APIContextProvider: React.FC<APIContextProviderProps> = props => {
    const [table, setTable] = useState<ViewDescriptor | null>(
        props.table || null
    )

    return (
        <APIContext.Provider value={{ table, setTable }}>
            {props.children}
        </APIContext.Provider>
    )
}
