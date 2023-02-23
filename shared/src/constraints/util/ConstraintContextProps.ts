import type { ViewDescriptor } from "@intutable/lazy-views"
import type { ProjectDescriptor, TableDescriptor } from "@intutable/project-management/dist/types"
import { Row, SerializedViewData } from "src/types"
import type { InputMask } from "../../input-masks/types"

export type ConstraintContextProps = {
    project: ProjectDescriptor
    table: TableDescriptor
    view: ViewDescriptor
    inputMask: Omit<InputMask, "constraints">
    data: SerializedViewData // TODO: add MergedColumns
    currentRecord: Row
    // user: User
}
