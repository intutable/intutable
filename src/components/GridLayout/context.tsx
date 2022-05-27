import { ViewDescriptor } from "@intutable/lazy-views/dist/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import React, { useEffect, useState } from "react"

export type GridLayoutProps<K extends string, P extends keyof GridLayoutElementAttributes> = {
    elements: GridLayoutElements<K>
    setElement: (update: {prop: P, value: GridLayoutElementAttributes[P]}) => void
}
export type GridLayoutElementAttributes = {
        open: boolean
}
export type GridLayoutElements<K extends string> = {
    [name in K]: GridLayoutElementAttributes
}

const initialState: GridLayoutProps = {
    elements: undefined!
    setElement: undefined!
}

const GridLayout = React.createContext<GridLayoutProps>(undefined!)

export const useGridLayout = () => React.useContext(GridLayout)

export type GridLayoutProviderProps<K extends string> = {
    children: React.ReactNode
    elements: GridLayoutElements<K>
}


export const GridLayoutProvider: React.FC<GridLayoutProviderProps> = props => {
    const [elements, setElement] = useState(props.elements)

    return (
        <GridLayout.Provider value={{}}>{props.children}</GridLayout.Provider>
    )
}
