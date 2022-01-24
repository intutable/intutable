import type {
    Row,
    ServerColumn,
    ServerTableData,
    TableData,
    Column,
    ServerRow,
} from "@api/types"
import { isCellType, CellType } from "@datagrid/Cell/celltype-management"
import type { EditorProps, HeaderRendererProps } from "react-data-grid"
import { Cell } from "@datagrid/Cell"
import { ColumnHeader } from "@datagrid/ColumnHeader"
// TODO: (04.12.21): test this function and implement the components for each cell type

/**
 * Serializes
 */
const serialize = (table: TableData): ServerTableData => {
    /**
     * TODO:
     * 1.1 remove IDs from each row
     * 1.2 and the ID column
     * 2. remove not supported properties
     * 3. cast properties
     */

    // 1.1
    const rows: ServerRow[] = table.rows.map(row => {
        const { id, ...rest } = row
        return rest
    })

    // 2. currently `editor` is not supported. `headerRenderer` does not need to be saved
    const columns: ServerColumn[] = table.columns.map(
        col =>
            ({
                name: col.name,
                key: col.key,
                editable: col.editable,
                editor: "string" as CellType, // TODO: infer from component (do this when it is finally supported)
            } as ServerColumn)
    )

    // 1.2
    columns.shift()

    return {
        tableName: table.tableName,
        columns,
        rows,
    }
}

/**
 * Deserializes
 */
const deserialize = (table: ServerTableData): TableData => {
    /**
     * TODO:
     * 1.1 apply an ID to each row
     * 1.2
     * 2. add missing properties (placeholders, since backend does not support them)
     */

    console.log(1, table)

    // 1.1
    const rows: Row[] = table.rows.map(
        (row, index) =>
            ({
                ...row,
                id: index + 1,
            } as Row)
    )

    // 2.
    const columns: Column[] = table.columns.map(col => ({
        name: col.name,
        key: col.key,
        editable: col.editable,
        editor: isCellType(col.editor)
            ? (props: EditorProps<Row>) => (
                  <Cell
                      type={col.editor}
                      access="editable"
                      position="left"
                      editorProps={props}
                  />
              )
            : undefined,
        editorOptions: {
            editOnClick: true,
        },
        headerRenderer: (props: HeaderRendererProps<any>) => {
            return (
                <ColumnHeader
                    label={props.column.name as string}
                    type={col.editor}
                />
            )
        },
    }))

    // 1.2
    const idCol: Column = {
        name: "ID",
        key: "id",
        editable: false,
        resizable: false,
        sortable: true,
        width: 40,
        editor: (props: EditorProps<Row>) => (
            <Cell
                type={"boolean"}
                access="readonly"
                position="left"
                editorProps={props}
            />
        ),
    }
    columns.unshift(idCol)

    return {
        tableName: table.tableName,
        columns,
        rows,
    }
}

export const SerializableTable = {
    serialize,
    deserialize,
}
