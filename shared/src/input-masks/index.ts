import { ViewData, ViewInfo } from "@intutable/lazy-views"
import { TableData, TableDescriptor } from "@intutable/project-management/dist/types"
import { InputMask } from "./types"
import * as DB from "./database"

type UNSAFE_ViewData = ViewData & { inputMasks: InputMask<"view">[] }
type UNSAFE_TableData = TableData<Record<string, unknown>> & { inputMasks: InputMask<"table">[] }

export const viewHasInputMasks = (view: ViewInfo): InputMask<"view">[] =>
    DB.getViewMasks().filter(mask => mask.origin.viewId === view.descriptor.id)

export const tableHasInputMasks = (table: TableDescriptor): InputMask<"table">[] =>
    DB.getTableMasks().filter(mask => mask.origin.tableId === table.id)

export const mountInputMasksOnView = (view: ViewData, inputMasks: InputMask<"view">[]): ViewData =>
    ({
        ...view,
        inputMasks: [...(view as unknown as UNSAFE_ViewData).inputMasks, ...inputMasks],
    } as ViewData)
export const mountInputMasksOnTable = (
    table: TableData<Record<string, unknown>>,
    inputMasks: InputMask<"table">[]
): TableData<Record<string, unknown>> =>
    ({
        ...table,
        inputMasks: [...(table as unknown as UNSAFE_TableData).inputMasks, ...inputMasks],
    } as TableData<Record<string, unknown>>)
