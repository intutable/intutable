import { coreRequest } from "@app/api/coreinterface/coreRequest"
import type { CurrentUser } from "@context/AuthContext"
import { CHANNEL } from "."
import { ProjectManagement as PM } from "./Type Annotations/ProjectManagement"

export const updateRow = async (
    user: CurrentUser,
    tableName: PM.Table.Name,
    condition: any[],
    update: { [index: string]: any }
): Promise<void> => {
    await coreRequest(
        CHANNEL.DATABASE,
        "update",
        { table: tableName, condition, update },
        user.authCookie
    )
}
