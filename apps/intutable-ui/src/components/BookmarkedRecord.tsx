import { Bookmark } from "@datagrid/RowMask/Bookmark"
import KeyIcon from "@mui/icons-material/Key"
import StarIcon from "@mui/icons-material/Star"
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    IconButton,
    Stack,
    Typography,
} from "@mui/material"
import { useBookmark } from "hooks/useBookmark"
import { useRouter } from "next/router"

export const BookmarkedRecord: React.FC<{ bookmark: Bookmark }> = ({ bookmark }) => {
    const router = useRouter()
    const { removeBookmark } = useBookmark()

    return (
        <Card
            onClick={() => router.push(bookmark.url)}
            sx={{
                maxWidth: "220px",
            }}
        >
            <CardActionArea sx={{ height: "100%" }}>
                <CardContent sx={{ height: "100%" }}>
                    <Stack direction="row" alignContent="center" gap={1} sx={{ height: "100%" }}>
                        <Stack direction="column">
                            <Stack direction="row" alignItems="center" gap={1} marginBottom={3}>
                                <KeyIcon fontSize="small" />
                                <Typography>
                                    {bookmark.formattedPrimiaryColumnValue || <em>Leer</em>} (#
                                    {bookmark.row.index})
                                </Typography>
                            </Stack>
                            <Box flexGrow={1} />
                            <Typography variant="caption">
                                {bookmark.project.name} &#8250; {bookmark.table.name} &#8250;{" "}
                                {bookmark.view.name}
                            </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center">
                            <IconButton
                                size="small"
                                onClick={e => {
                                    e.stopPropagation()
                                    removeBookmark(bookmark)
                                }}
                                edge="end"
                            >
                                <StarIcon fontSize="small" sx={{ color: "#FFDF00" }} />
                            </IconButton>
                        </Stack>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}
