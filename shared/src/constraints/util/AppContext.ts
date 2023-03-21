import type { ViewData, ViewDescriptor } from "@intutable/lazy-views"
import type { ProjectDescriptor, TableDescriptor } from "@intutable/project-management/dist/types"
import { Row, SerializedViewData } from "../../types"
import type { InputMask } from "../../input-masks/types"
import type { SerializedLogEntry } from "../dos/Log/Log"

/**
 * If the constraints were imported and executed only inside the frontend,
 * we could directly use hooks and their states instead of forwarding them –
 * meaning we could access the frontends scope instead of borrowing injected
 * methods and variables.
 *
 * Since the constraints are not only conditions and executements,
 * but also generate a serialized definition, we probably rely on
 * these injected states and dispatchers.
 *
 * Most of them are just the signatures of hook properties.
 * Some are methods living inside the context that validates constraints.
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
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
