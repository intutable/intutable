import { coreRequest } from "@app/api/coreinterface/coreRequest"
import type { CurrentUser } from "@context/AuthContext"
import { CHANNEL } from "."
import { ProjectManagement as PM } from "./Type Annotations/ProjectManagement"

export const updateRow = async (
    user: CurrentUser,
    tableName: PM.Table.Name,
    condition: unknown[],
    update: { [index: string]: unknown } // TODO: maybe replace type by `Row`??
): Promise<void> => {
    await coreRequest(
        CHANNEL.DATABASE,
        "update",
        { table: tableName, condition, update },
        user.authCookie
    )
}
