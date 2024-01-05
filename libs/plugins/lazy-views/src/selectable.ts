import { ViewInfo } from "./types/main"

export * from "./types/selectable"
export {
    tableId,
    viewId,
    isTable,
    isView,
    asTable,
    asView,
    getId,
    getSpecifierId,
    getDescriptorId,
} from "./internal/selectable"
