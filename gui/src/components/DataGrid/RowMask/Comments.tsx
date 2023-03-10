import { Box, Divider, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { Comment } from "@shared/input-masks/types"
import { useInputMask } from "hooks/useInputMask"

const sortCommentsByDate = (a: Comment, b: Comment) =>
    new Date(a.created).getTime() - new Date(b.created).getTime()
const createDateGroupMap = (comments: Comment[]): DateGroupMap =>
    comments.reduce((group: DateGroupMap, comment) => {
        const date = new Date(comment.created).toLocaleDateString()
        group[date] = group[date] ?? []
        group[date].push(comment)
        return group
    }, {})
const groupAndSortComments = (comments: Comment[]): Comment[][] => {
    const dateGroupMap = createDateGroupMap(comments)
    const groupedArray = Object.values(dateGroupMap)
    const sorted = groupedArray.sort((a, b) => sortCommentsByDate(a[0], b[0]))
    return sorted
}
type DateGroupMap = {
    /** key = date.toLocaleDateString() */
    [key: string]: Comment[]
}

type DateGroupProps = Pick<Comment, "created"> & { children: React.ReactNode }
const DateGroup: React.FC<DateGroupProps> = props => {
    return (
        <>
            <Divider sx={{ mt: 2 }}>
                <Typography variant="caption">{props.created.toLocaleDateString()}</Typography>
            </Divider>
            {props.children}
        </>
    )
}

const Comment: React.FC<{ comment: Comment }> = ({ comment }) => {
    const theme = useTheme()
    return (
        <Box
            sx={{
                borderRadius: theme.shape.borderRadius,
                bgcolor: comment.highlighted
                    ? theme.palette.warning.main
                    : theme.palette.action.selected,
                py: 0.8,
                px: 1.5,
                mb: 0.5,
                overflowWrap: "break-word",
                width: 1,
            }}
        >
            <Typography variant="body2" fontSize="small">
                {comment.text}
            </Typography>
            <Typography
                variant="body2"
                sx={{ fontStyle: "italic", fontWeight: theme.typography.fontWeightBold, mt: 0.5 }}
                fontSize="small"
            >
                ~{comment.user}
            </Typography>
        </Box>
    )
}

export const CommentSection: React.FC = () => {
    const { currentInputMask } = useInputMask()

    if (currentInputMask == null) return null
    return (
        <Box
            sx={{
                width: 1,
                height: 1,
                boxSizing: "border-box",
                overflowY: "scroll",
            }}
        >
            {currentInputMask.comments.length === 0 && (
                <Typography>Keine Kommentare vorhanden</Typography>
            )}
            <Stack direction="column">
                {groupAndSortComments(currentInputMask.comments).map(group => (
                    <DateGroup
                        created={new Date(group[0].created)}
                        key={new Date(group[0].created).toLocaleDateString()}
                    >
                        {group.map(comment => (
                            <Comment comment={comment} key={comment.text} />
                        ))}
                    </DateGroup>
                ))}
            </Stack>
        </Box>
    )
}
