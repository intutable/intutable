import {
    ViewDescriptor,
    ColumnSpecifier,
    ColumnInfo,
    listViews,
    viewId as mkViewId,
    addColumnToView,
} from "@intutable/lazy-views"
import { coreRequest } from "api/utils"

export async function addColumnToFilterViews(
    viewId: ViewDescriptor["id"],
    column: ColumnSpecifier,
    authCookie?: string
): Promise<ColumnInfo[]> {
    console.log(authCookie)
    const filterViews = await coreRequest<ViewDescriptor[]>(
        listViews(mkViewId(viewId)),
        authCookie
    )
    return Promise.all(filterViews.map(v => coreRequest<ColumnInfo>(
        addColumnToView(v.id, column),
        authCookie
    )))
}
