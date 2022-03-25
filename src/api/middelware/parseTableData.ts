import { JtData } from "@intutable/join-tables/dist/types"
import { DeSerialize, Parser } from "api/utils"
import { Middleware, SWRHook } from "swr"
import { TableData } from "types"

export const parseTableData: Middleware =
    (useSWRNext: SWRHook) => (key, fetcher, config) => {
        const swr = useSWRNext(key, fetcher, config)

        const route: string = Array.isArray(key) ? key[0] : key

        const routeRegex = RegExp("/api/table/\\d*") // "/api/table/[id]"
        if (routeRegex.test(route) === false || swr.data == null) return swr

        const unparsedTableData = swr.data as unknown as JtData

        // parse
        const parsedTableData: TableData.Serialized =
            Parser.Table.parse(unparsedTableData)

        // deserialize
        const deserializedTableData: TableData.Deserialized =
            DeSerialize.Table.deserialize(parsedTableData)

        return Object.assign({}, swr, {
            data: deserializedTableData,
        })
    }
