import cells from "@datagrid/Cells"
import LinkColumnFormatter from "@datagrid/Cells/components/LinkColumn/LinkColumnFormatter"
import { headerRenderer } from "@datagrid/renderers"
import { Column } from "types"

export const applyColumnProxy = (column: Column.Serialized): ProxyColumn =>
    new Proxy(column as ProxyColumn, ColumnProxyHandler)

// TODO: this could replace most of the ColumnUtility

// must be backwards compatible with `Column`
export type ProxyColumn = Column.Deserialized & {
    /**
     * The proxy does not store an actual serialized object in itself.
     * But you can pass by the get-traps with this property.
     * */
    serialized: Column.Serialized
    /**
     *
     */
    __isProxy: boolean
}

const ColumnProxyHandler: ProxyHandler<ProxyColumn> = {
    get(target, prop, receiver) {
        if (target._cellContentType == null)
            throw new Error("ColumnProxyHandler: _cellContentType is null")

        const cell = cells.getCell(target._cellContentType)

        switch (prop as keyof ProxyColumn) {
            case "editable":
                // index columns are not editable, at least no by the editable
                if (target._kind === "index") return false
                // some types don't have an editor and should not be editable
                if (cell.editor == null) return false
                // TODO: further checking here, e.g. should link and lookup columns be editable??
                return target.editable

            case "formatter":
                // special treatment when the kind is 'link' (this will be deprecated in the future)
                if (target._kind === "link") return LinkColumnFormatter
                // otherwise choose the formatter by its type
                return cell.formatter

            case "headerRenderer":
                // for now no actions on index columns
                if (target._kind === "index") return null
                return headerRenderer

            case "editorOptions":
                return cell.editorOptions

            // pass by
            case "serialized":
                return target as Column.Serialized

            case "__isProxy":
                return true

            default:
                return Reflect.get(target, prop, receiver)
        }
    },
}
