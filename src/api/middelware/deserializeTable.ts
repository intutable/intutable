import { DeSerialize } from "api/utils"
import { Middleware, SWRHook } from "swr"
import { TableData } from "types"

/**
 * Deserializes {@link TableData}. As of now, this type is only returned
 * from the `/pages/api/view/[viewId]` endpoint
 */
export const deserializeTable: Middleware =
    (useSWRNext: SWRHook) => (key, fetcher, config) => {
        const swr = useSWRNext(key, fetcher, config)

        if (
            key == null ||
            Object.prototype.hasOwnProperty.call(key, "url") === false
        )
            return swr

        const routeKey: string = (key as { url: string }).url
        // "/api/view/[id]"
        const routeRegex = RegExp("/api/view/\\d*")
        if (routeRegex.test(routeKey) === false || swr.data == null) return swr

        const tableData = swr.data as unknown as TableData.Serialized

        // deserialize
        const deserializedTableData: TableData.Deserialized =
            DeSerialize.Table.deserialize(tableData)

        return Object.assign({}, swr, {
            data: deserializedTableData,
        })
    }
