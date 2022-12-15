import { ViewInfo } from "@intutable/lazy-views"
import { SerializedViewData } from "src/types"
import * as DB from "./database"
import { InputMask } from "./types"

export const getInputMasksFor = (view: ViewInfo): InputMask[] =>
    DB.getAll().filter(mask => mask.origin.view === view.descriptor.id || mask.origin.view === "*")

export const mountInputMasks = (view: SerializedViewData, inputMasks: InputMask[]): SerializedViewData =>
    ({
        ...view,
        inputMasks,
    } as SerializedViewData)
