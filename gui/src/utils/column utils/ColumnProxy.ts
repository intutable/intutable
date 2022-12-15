import { Cell, cellMap } from "@datagrid/Cells"
import LinkColumnFormatter from "@datagrid/Cells/components/LinkColumn/LinkColumnFormatter"
import { HeaderRenderer } from "@datagrid/renderers"
import { Column } from "types"

/** @deprecated */
export const mountColumnProxy = (column: Column.Serialized): ProxyColumn =>
    new Proxy(column as ProxyColumn, ColumnProxyHandler)

// must be backwards compatible with `Column`
/** @deprecated */
export type ProxyColumn = Column.Deserialized & {
    /**
     * The proxy does not store an actual serialized object in itself.
     * But you can by-pass the get-traps with this property.
     * */
    serialized: Column.Serialized
    __isProxy: true
    /** by pass to the instantiated cell component */ // TODO: maybe expose it to Column.Deserialized
    cell: Cell
}

// BUG (27.11.22): the proxy does not work as intended

/** @deprecated */
export const ColumnProxyHandler: ProxyHandler<ProxyColumn> = {
    get(target, prop, receiver) {
        const cellCtor = cellMap.getCellCtor(target.cellType)
        const cell = new cellCtor(target as Column.Serialized)

        switch (prop as keyof ProxyColumn) {
            case "editable":
                // index columns are not editable, at least no by the editable
                if (target.kind === "index") return false
                // some types don't have an editor and should not be editable
                if (cell.editor == null) return false
                // TODO: further checking here, e.g. should link and lookup columns be editable??
                return target.editable

            case "formatter":
                // special treatment when the kind is 'link' (this will be deprecated in the future)
                if (target.kind === "link") return LinkColumnFormatter
                // otherwise choose the formatter by its type
                return cell.formatter

            case "editor":
                return cell.editor

            case "headerRenderer":
                return HeaderRenderer // BUG: bind this-context to the instance

            case "editorOptions":
                return cell.editorOptions

            // by-pass
            case "serialized":
                return target as Column.Serialized

            case "__isProxy":
                return true

            case "cell":
                return cell // BUG: bind this-context to the instance

            default:
                return Reflect.get(target, prop, receiver)
        }
    },
}
