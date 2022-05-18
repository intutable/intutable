import { CellContentType } from "./types/CellContentType"
import { EditorComponent } from "./types/EditorComponent"

export const inferEditorType = (component: EditorComponent): CellContentType =>
    "string" // TODO: infer somehow
