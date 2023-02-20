import { Bookmark, BookmarkButton } from "@datagrid/RowMask/Bookmark"
import { ViewDescriptor } from "@intutable/lazy-views/dist/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import AddRecordIcon from "@mui/icons-material/PlaylistAddCircle"
import TableIcon from "@mui/icons-material/TableRows"
import ViewIcon from "@mui/icons-material/TableView"
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material"
import Icon from "@mui/material/Icon"
import { useTheme } from "@mui/material/styles"
import { InputMask } from "@shared/input-masks/types"
import { useRouter } from "next/router"
import { UrlObject } from "url"
import StarIcon from "@mui/icons-material/Star"
import { useAPI } from "context"
import { useUserSettings } from "hooks/useUserSettings"

export const BookmarkedRecord: React.FC<{ bookmark: Bookmark }> = ({ bookmark }) => {
    const theme = useTheme()
    const router = useRouter()
    const { userSettings, changeUserSetting } = useUserSettings()

    const removeBookmark = () => {
        if (userSettings == null) return
        changeUserSetting({
            bookmarkedRecords: userSettings.bookmarkedRecords.filter(
                b => b.rowId !== bookmark.rowId && b.tableId !== bookmark.tableId
            ),
        })
    }

    const openRecord = () => {}

    return (
        <Card
            onClick={openRecord}
            sx={{
                "&:hover": {
                    bgcolor: theme.palette.action.hover,
                    cursor: "pointer",
                },

                maxWidth: "200px",
            }}
        >
            <CardContent>
                <Stack direction="column">
                    <Stack direction="row" gap={2} alignContent="center" sx={{ mb: 1 }}>
                        <Typography>
                            {bookmark.projectId} &#8250; {bookmark.tableId}
                        </Typography>
                        <Box flexGrow={1} />
                        <IconButton size="small" onClick={removeBookmark}>
                            <StarIcon fontSize="small" sx={{ color: "#FFDF00" }} />
                        </IconButton>
                    </Stack>
                </Stack>
            </CardContent>
            {/* <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button
                    size="small"
                    onClick={() =>
                        router.push(
                            card.url,
                            typeof card.url === "string" ? card.url : card.url.pathname!
                        )
                    }
                    disabled={card.inputMask.disabled}
                >
                    Einträge ansehen
                </Button>
                <Button
                    onClick={e => {
                        e.stopPropagation()
                        router.push(
                            card.callToActionUrl,
                            typeof card.url === "string" ? card.url : card.url.pathname!
                        )
                    }}
                    size="small"
                    disabled={card.inputMask.disabled}
                    startIcon={
                        card.inputMask.addRecordButtonIcon ? (
                            <Icon>{card.inputMask.addRecordButtonIcon}</Icon>
                        ) : (
                            <AddRecordIcon />
                        )
                    }
                    sx={{
                        fontWeight: "600",
                    }}
                >
                    {card.inputMask.addRecordButtonText ?? "Neuer Eintrag"}
                </Button>
            </CardActions> */}
        </Card>
    )
}
