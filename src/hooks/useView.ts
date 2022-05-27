import { useState } from "react"
import { TableHookOptions, useTable } from "./useTable"

/**
 * ### useView hook.
 *
 * Returns the data of a table.
 *
 * It uses the {@link APIContextProvider}
 * to determine the current selected table.
 *
 * @param {Partial<PublicConfiguration<TableData, any, BareFetcher<TableData>>>} [options.swrOptions] Options for the underlying {@link useSWR} hook.
 *
 * @param {ViewDescriptor} [options.table] If you want to fetch a diffrent table than specified in the api context, you can use this option.
 */
export const useView = (options?: TableHookOptions) => {
    const { data: table, mutate } = useTable(options)

    const [currentView, setCurrentView] = useState("view1")
    const views = ["view1", "view2"]

    return {
        views,
        currentView,
        setCurrentView,
    }
}
