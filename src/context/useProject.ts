import React, { useCallback, useContext, useEffect, useState } from "react"
import { useRouter } from "next/router"
import { getTablesFromProject, getTableData } from "@api/endpoints"
import type { TableData } from "@api/types"
import { useAuth } from "./AuthContext"

export type Data = {
    tables: string[]
    currentTable: string
    data: TableData | null
}

export type State = {
    project: Data | null
    loading: boolean
    error: Error | null
}

export const useProject = (project: string, initialData: Data) => {
    const { user } = useAuth()

    const [state, setState] = useState<State>({
        project: initialData,
        loading: false,
        error: null,
    })

    // useEffect(() => {
    //     if (user) {
    //         try {
    //             ;(async _ => {
    //                 const tablesInProject = await getTablesFromProject(
    //                     user,
    //                     project
    //                 )

    //                 const newData: Data = {
    //                     tables: tablesInProject,
    //                     currentTable: tablesInProject[0] || "",
    //                     data: null,
    //                 }

    //                 if (tablesInProject[0].length > 0) {
    //                     const tableData = await getTableData(
    //                         user,
    //                         tablesInProject[0],
    //                         project
    //                     )
    //                     newData.data = tableData
    //                 }

    //                 console.log("data:", newData)

    //                 // TODO: data is correct, but either setData doesnt work properly or the data doesnt arrive in project-slug

    //                 setState({
    //                     error: null,
    //                     loading: false,
    //                     project: newData,
    //                 })
    //             })()
    //         } catch (error) {
    //             setState({
    //                 error:
    //                     error instanceof Error
    //                         ? error
    //                         : new Error(
    //                               typeof error === "string"
    //                                   ? error
    //                                   : "Internal Unknown Error: Could not load the Table!"
    //                           ),
    //                 loading: false,
    //                 project: null,
    //             })
    //         }
    //     }
    // }, [project, user])

    return { state }
}
