import {
    Row,
    SerializedColumn,
    SerializedTableData,
    TableData,
    Column,
    SerializedRow,
    __KEYS__,
} from "@api"
import {
    isEditorType,
    EditorType,
} from "@app/components/DataGrid/Editor/editor-management"
import type { EditorProps, HeaderRendererProps } from "react-data-grid"
import { getEditor } from "@app/components/DataGrid/Editor/EditorComponents"
import { ColumnHeader } from "@datagrid/ColumnHeader"
import { Checkbox } from "@mui/material"
import { TextEditor } from "react-data-grid"

/**
 * Serializes
 */
const serialize = (table: TableData): SerializedTableData => {
    /**
     * TODO:
     * 1.1 remove IDs from each row
     * 1.2 and the ID column
     * 2. remove not supported properties
     * 3. cast properties
     */

    // Note: this is not used yet

    // 1.1
    const rows: SerializedRow[] = table.rows.map(row => {
        const sRow = { ...row } as SerializedRow
        delete sRow[__KEYS__.RDG_ID_KEY]
        delete sRow[__KEYS__.SELECT_COL_KEY]
        return sRow
    })

    // 2. currently `editor` is not supported. `headerRenderer` does not need to be saved
    const columns: SerializedColumn[] = table.columns.map(
        col =>
            ({
                name: col.name,
                key: col.key,
                editable: col.editable,
                editor: "string" as EditorType, // TODO: infer from component (do this when it is finally supported)
            } as SerializedColumn)
    )

    // 1.2
    columns.shift

    return {
        table: table.table,
        columns,
        rows,
    }
}

/**
 * Convert SerializedTableData (abstract, bound neither to database nor to
 * GUI) to {@link TableData}, which can directly be used with RDG.
 */
const deserialize = (table: SerializedTableData): TableData => {
    // 1.1
    const rows: Row[] = table.rows.map(
        (row, index) =>
            ({
                ...row,
                [__KEYS__.RDG_ID_KEY]: index + 1,
                [__KEYS__.SELECT_COL_KEY]: <Checkbox />,
            } as Row)
    )

    // 3.
    const columns: Column[] = table.columns.map(col => ({
        name: col.name,
        key: col.key,
        editable: col.editable,
        editor: isEditorType(col.editor) ? getEditor(col.editor) : undefined, // TODO: maybe add the default TextEditor from rdg?!
        // editor: TextEditor,
        editorOptions: {
            editOnClick: true,
        },
        headerRenderer: (props: HeaderRendererProps<Row>) => {
            return (
                <ColumnHeader
                    label={props.column.name as string}
                    type={col.editor}
                />
            )
        },
    }))

    // Add unique indices so that DataGrid can index cells
    const rdgIdCol: Column = {
        name: "ID",
        key: __KEYS__.RDG_ID_KEY,
        editable: false,
        resizable: true,
        sortable: true,
        width: 80,
    }
    columns.unshift(rdgIdCol)

    // 1.2
    const selectCol: Column = {
        name: <Checkbox />,
        key: __KEYS__.SELECT_COL_KEY,
        editable: true,
        resizable: false,
        sortable: true,
        width: 50,
    }
    columns.unshift(selectCol)

    return {
        table: table.table,
        columns,
        rows,
    }
}

export const SerializableTable = {
    serialize,
    deserialize,
}
