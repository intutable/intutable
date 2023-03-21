import type { ViewData, ViewDescriptor } from "@intutable/lazy-views"
import type { ProjectDescriptor, TableDescriptor } from "@intutable/project-management/dist/types"
import { Row, SerializedViewData } from "../../types"
import type { InputMask } from "../../input-masks/types"
import { SerializedLogEntry } from "../dos/Log/Log"

// TODO: if the constraints are imported and executed inside the frontend, we can directly use hooks and their states instead of forwarding them here
export namespace AppContext {
    export type State = {
        project: ProjectDescriptor
        table: TableDescriptor
        view: ViewData // TODO: add MergedColumns
        record: Row
        inputMask: InputMask
        // user: User
        // userSettings: UserSettings
    }
    export type Dispatch = {
        setTest: React.Dispatch<React.SetStateAction<boolean>>
        snackInfo: (message: string) => void
        addLogEntry: (logEntry: SerializedLogEntry) => void
    }
}
