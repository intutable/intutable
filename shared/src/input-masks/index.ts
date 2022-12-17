import { asView, ViewInfo } from "@intutable/lazy-views/dist"
import * as DB from "./database"
import { InputMask } from "./types"
import { isTableOrigin } from "./utils"

export type { UNSAFE_ViewData } from "./types"

export const getInputMasksFor = (view: ViewInfo): InputMask[] => {
    const masks = DB.getAll()

    const tabeleOfView = asView(view.source).view

    return masks.filter(mask =>
        isTableOrigin(mask.origin) ? mask.origin.tableId === tabeleOfView.id : mask.origin.viewId === view.descriptor.id
    )
}
