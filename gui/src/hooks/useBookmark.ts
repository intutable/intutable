import { cellMap } from "@datagrid/Cells"
import { Column } from "types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { useAPI } from "hooks/useAPI"
import { useView } from "hooks/useView"
import { Row, TableDescriptor, ViewDescriptor } from "types"
import { UrlObject } from "url"
import { useUserSettings } from "./useUserSettings"
import { useRowMask } from "context/RowMaskContext"

export type Bookmark = {
    project: ProjectDescriptor
    table: TableDescriptor
    view: ViewDescriptor
    row: { _id: number; index: number }
    formattedPrimiaryColumnValue: string
    url: UrlObject | string
}

export const useBookmark = () => {
    const { project, table, view } = useAPI()
    const { data } = useView()
    const { appliedInputMask } = useRowMask()
    const { userSettings, changeUserSetting } = useUserSettings()

    const isBookmarked = (row: { _id: number }): Bookmark | null => {
        if (userSettings == null || table == null) return null
        const found = userSettings.bookmarkedRecords.find(
            bookmark => bookmark.row._id === row._id && bookmark.table.id === table.id
        )
        return found ?? null
    }

    const captureBookmark = (props: { row: Row }): Bookmark => {
        if (!project || !table || !view || !data) {
            throw new Error("Missing project, table or view")
        }

        // get primary column value
        const primiaryColumn = data.columns.find(c => c.isUserPrimaryKey)
        if (!primiaryColumn) throw new Error("Missing primary key")
        const exporter = cellMap.getCellCtor(primiaryColumn.cellType).export
        const unformattedPrimaryColumnValue = props.row[primiaryColumn!.key]

        const callToActionURL: UrlObject = {
            pathname: `/project/${project.id}/table/${table.id}`,
            query: {
                viewId: view.id,
                record: props.row._id,
                ...(appliedInputMask && { inputMask: appliedInputMask }),
            },
        }

        return {
            project,
            table,
            view,
            row: { _id: props.row._id, index: props.row.index },
            formattedPrimiaryColumnValue: exporter(unformattedPrimaryColumnValue) as string,
            url: callToActionURL,
        }
    }

    const addBookmark = (bookmark: Bookmark) => {
        if (userSettings == null) return
        const newBookmarks = [...userSettings.bookmarkedRecords, bookmark]
        changeUserSetting({
            bookmarkedRecords: newBookmarks,
        })
    }
    const removeBookmark = (bookmark: Bookmark) => {
        if (userSettings == null) return
        const removed = userSettings.bookmarkedRecords.filter(
            b => (b.row._id === bookmark.row._id && b.table.id === bookmark.table.id) === false
        )
        changeUserSetting({
            bookmarkedRecords: removed,
        })
    }

    return {
        bookmarks: userSettings?.bookmarkedRecords ?? null,
        captureBookmark,
        isBookmarked,
        addBookmark,
        removeBookmark,
    }
}
