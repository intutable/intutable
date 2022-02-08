import { coreRequest } from "@app/api/utils/coreRequest"
import type { CurrentUser } from "@context/AuthContext"
import { CHANNEL } from "../utils"
import { ProjectManagement as PM } from "../utils/ProjectManagement_TypeAnnotations"

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
