import { ServerColumn } from "@api"
import { isCellType } from "@datagrid/Cell/types"
import type { Column } from "react-data-grid"
import { Cell } from "@datagrid/Cell"

const insert = {
    editor: (editor: ServerColumn["editor"]): Column<unknown>["editor"] =>
        isCellType(editor) ? Cell(editor) : undefined,
}

/**
 * Helper function which replaces the meta data from the database to the actual meta data.
 * This must be called on every columns object before it is used.
 * @param serverColumns
 */
export const getColumns = (
    serverColumns: ServerColumn[]
): Column<unknown>[] => {
    // TODO: implement

    const returnObject = serverColumns.map(serverColumns => ({
        ...serverColumns,
        editor: insert.editor(serverColumns.editor),
    }))

    return returnObject
}
