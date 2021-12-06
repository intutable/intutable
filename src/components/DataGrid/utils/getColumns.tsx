import type { ServerColumn } from "@api"
import { isCellType, CellType } from "@datagrid/Cell/types"
import type { Column, EditorProps } from "react-data-grid"
import { Cell } from "@datagrid/Cell"

// TODO: (04.12.21): test this function and implement the components for each cell type

/**
 * As long as the server sends the columns in a malformed structure, this utility is needed.
 */
export const transformHelper = (cols: any[]): ServerColumn[] =>
    cols.map(col => ({
        ...col,
        editor: "string",
    }))

/**
 * Helper function which replaces the meta data from the database to the actual meta data.
 * This must be called on every columns object before it is used.
 * @param serverColumns
 */
export const getColumns = (
    serverColumns: ServerColumn[]
): Column<unknown>[] => {
    // TODO: implement

    const returnObject = serverColumns.map(serverColumn => ({
        ...serverColumn,
        editor: isCellType(serverColumn.editor)
            ? (props: EditorProps<any>) => (
                  <Cell
                      type={serverColumn.editor as CellType}
                      data={""} // included in `editorProps`
                      access="editable"
                      position="left"
                      editorProps={props}
                  />
              )
            : undefined,
        editorOptions: {
            editOnClick: true,
        },
    }))

    return returnObject
}
