import { isRoute, Route } from "api"
import { DeSerialize, Parser } from "api/utils"
import { Middleware, SWRHook } from "swr"
import { TableData } from "types"

export const parseResponse: Middleware =
    (useSWRNext: SWRHook) => (key, fetcher, config) => {
        const swr = useSWRNext(key, fetcher, config)

        const _key: string = Array.isArray(key) ? key[0] : key
        if (isRoute(_key) === false) return swr

        const route = _key as Route
        if (route !== "/request/project-management/getTableData") return swr

        if (swr.data == null) return swr

        const unparsedTableData = swr.data as unknown as TableData.DBSchema
        const parsedTableData: TableData.Serialized =
            Parser.Table.parse(unparsedTableData)
        const deserializedTableData: TableData.Deserialized =
            DeSerialize.Table.deserialize(parsedTableData)

        return Object.assign({}, swr, {
            data: deserializedTableData,
        })
    }
