import { Column } from "types"
import cells, { Cell } from "@datagrid/Cells"
import LinkColumnFormatter from "@datagrid/Cells/components/LinkColumn/LinkColumnFormatter"
import { headerRenderer } from "@datagrid/renderers"

// TODO: this could replace most of the ColumnUtility

const ColumnProxyHandler: ProxyHandler<Column.Deserialized> = {
    get(target, prop, receiver) {
        if (target._cellContentType == null)
            throw new Error("ColumnProxyHandler: _cellContentType is null")
        const cell = cells.getCell(target._cellContentType)

        switch (prop as keyof Column) {
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

            default:
                return Reflect.get(target, prop, receiver)
        }
    },
}
