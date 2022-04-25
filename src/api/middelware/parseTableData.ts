import { ViewData } from "@intutable/lazy-views"
import { DeSerialize, Parser } from "api/utils"
import { Middleware, SWRHook } from "swr"
import { TableData } from "types"

export const parseTableData: Middleware =
    (useSWRNext: SWRHook) => (key, fetcher, config) => {
        const swr = useSWRNext(key, fetcher, config)

        if (
            key == null ||
            Object.prototype.hasOwnProperty.call(key, "url") === false
        )
            return swr

        const routeKey: string = (key as { url: string }).url
        const routeRegex = RegExp("/api/table/\\d*") // "/api/table/[id]"
        if (routeRegex.test(routeKey) === false || swr.data == null) return swr

        const unparsedTableData = swr.data as unknown as ViewData

        // parse // TODO: parsing should be moved to the next api
        const parsedTableData: TableData.Serialized =
            Parser.Table.parse(unparsedTableData)

        // deserialize
        const deserializedTableData: TableData.Deserialized =
            DeSerialize.Table.deserialize(parsedTableData)

        return Object.assign({}, swr, {
            data: deserializedTableData,
        })
    }
