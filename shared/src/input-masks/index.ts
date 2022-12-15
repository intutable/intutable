import { ViewData, ViewInfo } from "@intutable/lazy-views"
import { SerializedViewData } from "src/types"
import * as DB from "./database"
import { InputMask } from "./types"

export type UNSAFE_ViewData = ViewData & { inputMasks: InputMask[] }

export const getInputMasksFor = (view: ViewInfo): InputMask[] =>
    DB.getAll().filter(mask => mask.origin.view === "*" || mask.origin.view === view.descriptor.id)

export const mountInputMasks = (view: SerializedViewData, inputMasks: InputMask[]): SerializedViewData =>
    ({
        ...view,
        inputMasks: [...inputMasks],
    } as SerializedViewData)
