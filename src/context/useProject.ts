import React, { useCallback, useContext, useEffect, useState } from "react"
import { useRouter } from "next/router"
import { API } from "@api"
import type { ServerTableData, TableData } from "@api"
import { useAuth } from "./AuthContext"
import { SerializableTable } from "@app/components/DataGrid/utils"

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

const makeError = (error: unknown): Error =>
    error instanceof Error
        ? error
        : new Error(
              typeof error === "string"
                  ? error
                  : "Internal Unknown Error: Could not load the Table!"
          )

export const useProject = (project: string, initialData: Data) => {
    const { user } = useAuth()

    const [state, setState] = useState<State>({
        project: initialData,
        loading: false,
        error: null,
    })

    const _fetch = useCallback(
        async (table?: string): Promise<Data> =>
            new Promise((resolve, reject) => {
                if (user) {
                    try {
                        ;(async _ => {
                            const tablesInProject = await API.get.tablesList(
                                user,
                                project
                            )

                            const tableData = await API.get.table(
                                user,
                                table || tablesInProject[0],
                                project
                            )

                            const newData: Data = {
                                tables: tablesInProject,
                                currentTable: table || tablesInProject[0] || "",
                                data: SerializableTable.deserialize(tableData),
                            }

                            resolve(newData)
                        })()
                    } catch (error) {
                        reject(error)
                    }
                }
            }),
        [project, user]
    )

    const reload = useCallback(
        async (table?: string) => {
            // TODO: shows the loading skeleton for less than second, this has a bad impact on ux. Redesign loading spinners …
            // setState(prev => ({
            //     project: prev.project,
            //     loading: true,
            //     error: prev.error,
            // }))
            try {
                const data = await _fetch(
                    table || state.project?.currentTable || ""
                )
                setState({
                    project: data,
                    loading: false,
                    error: null,
                })
            } catch (error) {
                setState(prev => ({
                    project: prev.project,
                    loading: false,
                    error: makeError(error),
                }))
            }
        },
        [_fetch, state.project?.currentTable]
    )

    /**
     * Changes the current tables and loads the data.
     * @param {string} table must be in the list of available project tables.
     */
    const changeTable = async (table: string) => {
        if (state.project && state.project.tables.includes(table))
            await reload(table)
    }

    return { state, changeTable, reload }
}
