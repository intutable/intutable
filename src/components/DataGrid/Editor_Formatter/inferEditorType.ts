import { CellContentType } from "./types/CellContentType"
import { Editor } from "./types/Editor"

export const inferEditorType = (component: Editor): CellContentType => "string" // TODO: infer somehow
