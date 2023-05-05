import { asView, ViewInfo } from "@intutable/lazy-views/dist"
import * as DB from "./database"
import { InputMask } from "./types"
import { isTableIdOrigin, isTableNameOrigin, isViewIdOrigin, isViewNameOrigin } from "./utils"

export type { UNSAFE_ViewData } from "./types" // TODO: temporary for development

/** Returns an array of input masks that belong to a certain view OR table */
export const getInputMasksFor = (view: ViewInfo): InputMask[] => {
    const masks = DB.getAll()
    // get the table the view belongs to
    const viewsTable = asView(view.source).view

    // filter matching ids or names
    const match: InputMask[] = masks.filter(mask =>
        isViewNameOrigin(mask.origin)
            ? mask.origin.viewName === view.descriptor.name &&
              mask.origin.viewsTableName === viewsTable.name
            : isViewIdOrigin(mask.origin)
            ? mask.origin.viewId === view.descriptor.id
            : isTableIdOrigin(mask.origin)
            ? mask.origin.tableId === viewsTable.id
            : isTableNameOrigin(mask.origin)
            ? mask.origin.tableName === viewsTable.name
            : false
    )

    // filter inactive input masks
    return match.filter(inputMask => inputMask.active)
}

export const getInputMask = (id: string) => DB.getAll().find(inputMask => inputMask.id === id)
