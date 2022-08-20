import { static_implements } from "utils/static_implements"
import EditorComponent from "./types/EditorComponent"
import { FormatterComponent } from "./types/FormatterComponent"

export interface Validatable {
    isValid: <T = unknown>(value: T) => boolean
}

export interface Exportable {
    export: <T = unknown>(value: T) => unknown
}

export interface Convertable {
    convert: <T extends CellType>(to: T) => T
}

export default abstract class CellType
    implements Partial<Validatable>, Partial<Exportable>
{
    abstract readonly brand: string
    abstract label: string

    abstract editor?: EditorComponent | null
    abstract formatter: FormatterComponent

    abstract isValid?(value: unknown): boolean
    abstract export?(value: unknown): unknown
}
