import StarOutlineIcon from "@mui/icons-material/StarOutline"
import StarIcon from "@mui/icons-material/Star"
import { useUserSettings } from "hooks/useUserSettings"
import { Row, TableDescriptor, ViewDescriptor } from "types"
import { InputMask } from "@shared/input-masks/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { useMemo } from "react"
import { useAPI } from "context"
import { IconButton } from "@mui/material"
import { useInputMask } from "hooks/useInputMask"
import { useRowMask } from "context/RowMaskContext"
import { UrlObject } from "url"
import { Bookmark, useBookmark } from "hooks/useBookmark"
export type { Bookmark }

export const BookmarkButton: React.FC<{ row: Row }> = props => {
    const { tableId, projectId } = useAPI()
    const { appliedInputMask } = useRowMask()
    const { userSettings, changeUserSetting } = useUserSettings()
    const { isBookmarked, addBookmark, removeBookmark, captureBookmark } = useBookmark()

    const toggle = () => {
        const bookmark = isBookmarked(props.row)
        if (bookmark != null) {
            // remove
            removeBookmark(bookmark)
        } else {
            // add
            const captured = captureBookmark({ row: props.row })
            addBookmark(captured)
        }
    }

    if (userSettings == null || tableId == null) return null

    return (
        <IconButton size="small" onClick={toggle}>
            {isBookmarked(props.row) != null ? (
                <StarIcon fontSize="small" sx={{ color: "#FFDF00" }} />
            ) : (
                <StarOutlineIcon fontSize="small" />
            )}
        </IconButton>
    )
}
