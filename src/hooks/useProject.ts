/**
 * @deprecated file
 */

import type { ProjectListElement, TableData } from "@api"
import { TableList, TableListElement } from "@api"
import { SerializableTable } from "@app/components/DataGrid/utils"
import { useCallback, useState } from "react"
import { useAuth } from "../context/AuthContext"

/**
 * // TODO: reload automatically whenever an api call is made (perhaps a ctx ie is needed for)
 */

export type Data = {
    tables: TableList
    currentTable: TableListElement | null
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

/**
 * @deprecated
 */
export const useProject = (project: ProjectListElement, initialData: Data) => {
    const { user, API } = useAuth()

    const [state, setState] = useState<State>({
        project: initialData,
        loading: false,
        error: null,
    })

    const _fetch = useCallback(
        (table?: TableListElement): Promise<Data> =>
            new Promise((resolve, reject) => {
                if (!user || !API) return reject()
                API.get.tablesList(project.projectId).then(tablesInProject => {
                    API.get
                        .table(table?.tableId || tablesInProject[0].tableId)
                        .then(tableData => {
                            const newData: Data = {
                                tables: tablesInProject,
                                currentTable: table || tablesInProject[0],
                                data: SerializableTable.deserialize(tableData),
                            }

                            resolve(newData)
                        })
                })
            }),
        [API, project.projectId, user]
    )

    const reload = useCallback(
        async (table?: TableListElement) => {
            // TODO: shows the loading skeleton for less than second, this has a bad impact on ux. Redesign loading spinners …
            // setState(prev => ({
            //     project: prev.project,
            //     loading: true,
            //     error: prev.error,
            // }))
            try {
                const data = await _fetch(
                    table || state.project?.currentTable || undefined
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
     * @param {string} tableId must be in the list of available project tables.
     */
    const changeTable = async (table: TableListElement) => {
        if (state.project) await reload(table)
    }

    return { state, changeTable, reload }
}
