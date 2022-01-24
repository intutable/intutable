import {
    Row,
    ServerColumn,
    ServerTableData,
    TableData,
    Column,
    ServerRow,
    __KEYS__,
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

    // Note: this is not used yet

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
    columns.shift

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
     * 1.2 add id col at first position
     * 2. add select cell
     * 3. add missing properties (placeholders, since backend does not support them)
     */

    // 1.1
    const rows: Row[] = table.rows.map(
        (row, index) =>
            ({
                ...row,
                [__KEYS__.ID_COL_KEY]: index + 1,
                [__KEYS__.SELECT_COL_KEY]: false,
            } as Row)
    )

    // 3.
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
        resizable: true,
        sortable: true,
        width: 80,
    }
    columns.unshift(idCol)

    // 2.
    const selectCol: Column = {
        name: <>NOT IMPLEMENTED</>,
        key: "__select",
        editable: false,
        resizable: false,
        sortable: false,
        width: 50,
        editor: (props: EditorProps<Row>) => (
            <Cell
                type={"boolean"}
                access="editable"
                position="center"
                editorProps={props}
            />
        ),
        // headerRenderer: ()
    }
    columns.unshift(selectCol)

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
