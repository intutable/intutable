import StarOutlineIcon from "@mui/icons-material/StarOutline"
import StarIcon from "@mui/icons-material/Star"
import { useUserSettings } from "hooks/useUserSettings"
import { Row, TableDescriptor } from "types"
import { InputMask } from "@shared/input-masks/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { useMemo } from "react"
import { useAPI } from "context"
import { IconButton } from "@mui/material"
import { useInputMask } from "hooks/useInputMask"
import { useRowMask } from "context/RowMaskContext"

export type Bookmark = {
    projectId: ProjectDescriptor["id"]
    tableId: TableDescriptor["id"]
    rowId: Row["_id"]
    inputMask?: InputMask["id"]
}

export const BookmarkButton: React.FC<{ row: { _id: number } }> = props => {
    const { tableId, projectId } = useAPI()
    const { appliedInputMask } = useRowMask()
    const { userSettings, changeUserSetting } = useUserSettings()

    const isBookmarked: boolean = useMemo(() => {
        if (userSettings == null || tableId == null) return false
        return userSettings.bookmarkedRecords.some(
            bookmark => bookmark.rowId === props.row._id && bookmark.tableId === tableId
        )
    }, [props.row._id, tableId, userSettings])

    const toggle = () => {
        if (userSettings == null || tableId == null || projectId == null) return
        if (isBookmarked) {
            // remove
            changeUserSetting({
                bookmarkedRecords: userSettings.bookmarkedRecords.filter(
                    b => b.rowId !== props.row._id && b.tableId !== tableId
                ),
            })
        } else {
            // add
            changeUserSetting({
                bookmarkedRecords: [
                    ...userSettings.bookmarkedRecords,
                    {
                        projectId,
                        tableId,
                        rowId: props.row._id,
                        inputMask: appliedInputMask ?? undefined,
                    },
                ],
            })
        }
    }

    if (userSettings == null || tableId == null) return null

    return (
        <IconButton size="small" onClick={toggle}>
            {isBookmarked ? (
                <StarIcon fontSize="small" sx={{ color: "#FFDF00" }} />
            ) : (
                <StarOutlineIcon fontSize="small" />
            )}
        </IconButton>
    )
}
