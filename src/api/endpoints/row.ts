import { coreRequest } from "@app/api/utils/coreRequest"
import { Column } from "@app/types/types"
import type { CurrentUser } from "@context/AuthContext"
import { CHANNEL } from "../utils"
import { ProjectManagement as PM } from "../utils/ProjectManagement_TypeAnnotations"

export const updateRow = async (
    user: CurrentUser,
    project: PM.Project,
    table: PM.Table,
    condition: unknown[],
    update: { [index: string]: unknown }
): Promise<void> => {
    await coreRequest(
        CHANNEL.DATABASE,
        "update",
        {
            table: `p${project.projectId}_${table.tableName}`,
            condition,
            update,
        },
        user.authCookie
    )
}
