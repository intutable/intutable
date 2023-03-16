import type { ViewDescriptor } from "@intutable/lazy-views"
import type { ProjectDescriptor, TableDescriptor } from "@intutable/project-management/dist/types"
import { Row, SerializedViewData } from "src/types"
import type { InputMask } from "../../input-masks/types"

export namespace AppContext {
    export type State = {
        project: ProjectDescriptor
        table: TableDescriptor
        view: ViewDescriptor
        inputMask: Omit<InputMask, "constraints">
        data: SerializedViewData // TODO: add MergedColumns
        currentRecord: Row
        // user: User
    }
    export type Dispatch = {
        setTest: React.Dispatch<React.SetStateAction<boolean>>
    }
}