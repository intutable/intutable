import StarIcon from "@mui/icons-material/Star"
import StarOutlineIcon from "@mui/icons-material/StarOutline"
import { IconButton } from "@mui/material"
import { useAPI } from "context"
import { Bookmark, useBookmark } from "hooks/useBookmark"
import { useUserSettings } from "hooks/useUserSettings"
import { Row } from "types"
export type { Bookmark }

export const BookmarkButton: React.FC<{ row: Row }> = props => {
    const { tableId } = useAPI()
    const { userSettings } = useUserSettings()
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
                <StarOutlineIcon
                    fontSize="small"
                    sx={{
                        "&:hover": {
                            color: "#FFDF00",
                        },
                    }}
                />
            )}
        </IconButton>
    )
}
