import type { ViewDescriptor } from "@intutable/lazy-views"
import type { ProjectDescriptor, TableDescriptor } from "@intutable/project-management/dist/types"
import { Row, SerializedViewData } from "../../types"
import type { InputMask } from "../../input-masks/types"

// eslint-disable-next-line @typescript-eslint/no-namespace
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
        snackInfo: (message: string) => void
    }
}
