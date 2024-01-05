import { Column, ColumnType, SimpleColumnOption } from "@intutable-org/database/dist/types"

export const CHANNEL = "user-permissions"
export const GLOBAL_PERMISSION = ""

export const PERMISSIONS_TABLE_STRUCTURE: Column[] = [
    {
        name: "roleId",
        type: ColumnType.integer,
    },
    {
        name: "action",
        type: ColumnType.text,
    },
    {
        name: "subject",
        type: ColumnType.text,
    },
    {
        name: "subjectName",
        type: ColumnType.text,
    },
    {
        name: "conditions",
        type: ColumnType.text,
    },
]
