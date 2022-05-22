import { CellContentType } from "./types/CellContentType"
import { EditorComponent } from "./types/EditorComponent"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const inferEditorType = (component: EditorComponent): CellContentType =>
    "string" // TODO: infer somehow
